
// mark unit to NOT be deleted. Should be "RemoveFromUnitGroup"-ed later.
setup.qcImpl.AddUnitToUnitGroup = class AddUnitToUnitGroup extends setup.Cost {
  constructor(actor_name, unit_group) {
    super()

    this.actor_name = actor_name
    if (setup.isString(unit_group)) {
      this.unit_group_key = unit_group
    } else {
      this.unit_group_key = unit_group.key
    }
  }

  text() {
    var unitgroup = setup.unitgroup[this.unit_group_key]
    var qcu = State.variables.qcustomunitgroup
    if (!qcu) qcu = []
  
    var otherkey = unitgroup.key
    for (var i = 0; i < qcu.length; ++i) {
      var ug = qcu[i]
      if (ug.key == unitgroup.key) {
        otherkey = ug.otherkey
        break
      }
    }
  
    return `setup.qc.AddUnitToUnitGroup('${this.actor_name}', '${otherkey}')`
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    setup.unitgroup[this.unit_group_key].addUnit(unit)
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  explain(quest) {
    return `${this.actor_name} is added to unit group ${setup.unitgroup[this.unit_group_key].rep()}`
  }
}
