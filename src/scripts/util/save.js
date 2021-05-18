
setup.SaveUtil = {}

setup.SaveUtil.convertToClass = function (sv) {
  // Backwards compatibility tool
  // Converts existing objects to newer classes, if haven't
  var to_convert = {
    calendar: setup.Calendar,
    titlelist: setup.TitleList,
    friendship: setup.Friendship,
    bedchamberlist: setup.BedchamberList,
    contactlist: setup.ContactList,
    armory: setup.Armory,
    eventpool: setup.EventPool,
    family: setup.Family,
    inventory: setup.Inventory,
    opportunitylist: setup.OpportunityList,
    slaveorderlist: setup.SlaveOrderList,
    hospital: setup.Hospital,
    notification: setup.Notification,
    settings: setup.Settings,
    statistics: setup.Statistics,
    trauma: setup.Trauma,
    varstore: setup.VarStore,
    dutylist: setup.DutyList,
  }
  for (var key in to_convert) {
    if (key in sv && !(sv[key] instanceof to_convert[key])) {
      console.log(`Upgrading ${key} to class...`)
      sv[key] = setup.rebuildClassObject(to_convert[key], sv[key])
    }
  }

  var to_convert_list = {
    unit: setup.Unit,
    bedchamber: setup.Bedchamber,
    contact: setup.Contact,
    equipmentset: setup.EquipmentSet,
    opportunityinstance: setup.OpportunityInstance,
    questinstance: setup.QuestInstance,
    slaveorder: setup.SlaveOrder,
    buildinginstance: setup.BuildingInstance,
    company: setup.Company,
    fort: setup.Fort,
    team: setup.Team,
  }
  for (var key in to_convert_list) {
    if (key in sv) {
      for (var objkey in sv[key]) {
        if (!(sv[key][objkey] instanceof to_convert_list[key])) {
          console.log(`Upgrading ${key} ${objkey} to class...`)
          sv[key][objkey] = setup.rebuildClassObject(to_convert_list[key], sv[key][objkey])
        }
      }
    }
  }
}


/* Save fix so that latest variables are saved upon save */
setup.onSave = function (save) {
  if (State.passage == "MainLoop" || State.variables.qDevTool) {
    save.state.history[save.state.index].variables = setup.deepCopy(State.variables)
  }

  if (!State.variables.qDevTool) {
    for (var i = 0; i < save.state.history.length; ++i) {
      if (i != save.state.index) {
        save.state.history[i].variables = {};
      }
    }
  }

  // discard tile information
  for (var i = 0; i < save.state.history.length; ++i) {
    if (save.state.history[i].variables.roomlist) {
      save.state.history[i].variables.roomlist.resetCache()
    }
    if (save.state.history[i].variables.fortgrid) {
      save.state.history[i].variables.fortgrid.resetCache()
    }
    if (save.state.history[i].variables.gFortGridControl) {
      save.state.history[i].variables.gFortGridControl.resetCache()
    }
    if (save.state.history[i].variables.roomlist) {
      save.state.history[i].variables.roomlist.resetCache()
    }
  }
}

setup.onLoad = function (save) {
  var sv = save.state.history[save.state.index].variables
  if (!sv.qDevTool) {
  } else {
    if ('dtquest' in sv) {
      var dt = sv.dtquest
      if (dt.TYPE == 'quest') {
        setup.questtemplate[dt.key] = dt
      } else if (dt.TYPE == 'opportunity') {
        setup.opportunitytemplate[dt.key] = dt
      } else if (dt.TYPE == 'event') {
        setup.event[dt.key] = dt
      } else if (dt.TYPE == 'interaction') {
        setup.interaction[dt.key] = dt
      } else if (dt.TYPE == 'activity') {
        setup.activitytemplate[dt.key] = dt
      }
    }

    if ('qcustomtitle' in sv) {
      // reload them if necessary
      var qct = sv.qcustomtitle
      for (var i = 0; i < qct.length; ++i) {
        var custom = qct[i]
        if (!(custom.key in setup.title)) {
          new setup.Title(
            custom.key,
            custom.name,
            custom.description,
            custom.unit_text,
            custom.slave_value,
            custom.skill_adds,
          )
        }
      }
    }
    if ('qcustomunitgroup' in sv) {
      var qcu = sv.qcustomunitgroup
      for (var i = 0; i < qcu.length; ++i) {
        var custom = qcu[i]
        new setup.UnitGroup(
          custom.key,
          custom.name,
          custom.getUnitPools(),
          custom.reuse_chance,
          custom.unit_post_process,
        )
      }
    }
  }

  setup.BackwardsCompat.upgradeSave(sv) // apply backwards compat fixes
};

setup.rebuildClassObject = function (classobj, arglist) {
  var obj = Object.create(classobj.prototype)
  setup.copyProperties(obj, arglist)
  return obj
}

/**
 * @param {string} classname 
 * @param {*} arglist 
 * @param {string} [container]
 */
setup.deserializeClass = function (classname, arglist, container) {
  // if (classname == "ClassThatDoesNotExistAnymore") classname = "NewClass"
  let class_container = setup
  if (container) {
    const sep = container.split('.')
    if (sep[0] != 'setup') throw new Error(`Cannot deserialize non setup object: ${container}`)
    for (let i = 1; i < sep.length; ++i) {
      class_container = class_container[sep[i]]
    }
  }
  return setup.rebuildClassObject(class_container[classname], arglist)
}

/**
 * @param {string} classname 
 * @param {*} obj 
 * @param {string} [container]
 */
setup.toJsonHelper = function (classname, obj, container) {
  var dataobj = {}
  setup.copyProperties(dataobj, obj)
  if (!container) {
    return JSON.reviveWrapper(`setup.deserializeClass("${classname}", $ReviveData$)`, dataobj)
  } else {
    return JSON.reviveWrapper(`setup.deserializeClass("${classname}", $ReviveData$, "${container}")`, dataobj)
  }
}

setup.SaveUtil.getSaveAsText = function () {
  const saveObj = Object.assign({}, {
    id: Config.saves.id,
    // @ts-ignore
    state: State.marshalForSave(),
    version: null,
  })

  if (Config.saves.version) {
    saveObj.version = Config.saves.version
  }

  if (typeof Config.saves.onSave === 'function') {
    // @ts-ignore
    Config.saves.onSave(saveObj)
  }

  // Delta encode the state history and delete the non-encoded property.
  // @ts-ignore
  saveObj.state.delta = State.deltaEncode(saveObj.state.history)
  delete saveObj.state.history

  return JSON.stringify(saveObj)
}

setup.SaveUtil.importSaveFromText = function (text) {
  try {
    const saveObj = JSON.parse(text)
    if (!saveObj || !saveObj.hasOwnProperty('id') || !saveObj.hasOwnProperty('state')) {
      // @ts-ignore
      throw new Error(L10n.get('errorSaveMissingData'));
    }

    // Delta decode the state history and delete the encoded property.
    // @ts-ignore
    saveObj.state.history = State.deltaDecode(saveObj.state.delta);
    delete saveObj.state.delta;

    if (typeof Config.saves.onLoad === 'function') {
      // @ts-ignore
      Config.saves.onLoad(saveObj);
    }

    if (saveObj.id !== Config.saves.id) {
      // @ts-ignore
      throw new Error(L10n.get('errorSaveIdMismatch'));
    }

    // Restore the state.
    // @ts-ignore
    State.unmarshalForSave(saveObj.state); // may also throw exceptions

    // Show the active moment.
    Engine.show();
  }
  catch (ex) {
    // @ts-ignore
    UI.alert(`${ex.message.toUpperFirst()}.</p><p>${L10n.get('aborting')}.`);
    return false;
  }
  return true;
}

setup.deleteEndOfWeekCaches = function () {
  delete State.variables.gFortGridControl
  State.variables.fortgrid.resetCache()
}
