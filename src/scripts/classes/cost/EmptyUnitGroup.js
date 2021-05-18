
setup.qcImpl.EmptyUnitGroup = class EmptyUnitGroup extends setup.Cost {
  constructor(unit_group) {
    super()

    if (setup.isString(unit_group)) {
      this.unit_group_key = unit_group
    } else {
      this.unit_group_key = unit_group.key
    }
    if (!this.unit_group_key) throw new Error(`no key for unit group ${unit_group} in EmptyUnitGroup`)
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
    return `setup.qc.EmptyUnitGroup('${otherkey}')`
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var unitgroup = setup.unitgroup[this.unit_group_key]
    unitgroup.removeAllUnits()
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  explain(quest) {
    var unitgroup = setup.unitgroup[this.unit_group_key]
    return `Unitgroup ${unitgroup.rep()} is cleared of all units`
  }
}
