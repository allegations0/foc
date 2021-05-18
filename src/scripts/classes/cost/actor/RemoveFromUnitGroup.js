
setup.qcImpl.RemoveFromUnitGroup = class RemoveFromUnitGroup extends setup.Cost {
  constructor(actor_name) {
    super()

    this.actor_name = actor_name
  }

  text() {
    return `setup.qc.RemoveFromUnitGroup('${this.actor_name}')`
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    var group = unit.getUnitGroup()
    if (group) {
      group.removeUnit(unit)
    }
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  explain(quest) {
    return `${this.actor_name} is removed from their unit group, if any`
  }
}
