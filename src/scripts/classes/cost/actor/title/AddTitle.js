
setup.qcImpl.AddTitle = class AddTitle extends setup.Cost {
  constructor(actor_name, title) {
    super()

    this.actor_name = actor_name
  
    if (setup.isString(title)) {
      this.title_key = title
    } else {
      this.title_key = title.key
    }
  }

  text() {
    return `setup.qc.AddTitle('${this.actor_name}', '${this.title_key}')`
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    var title = setup.title[this.title_key]
    if (State.variables.titlelist.isHasTitle(unit, title)) {
    } else {
      State.variables.titlelist.addTitle(unit, setup.title[this.title_key])
      if (unit.isYourCompany()) {
        setup.notify(`a|Rep a|gain ${title.rep()}.`, {a: unit})
      }
    }
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  explain(quest) {
    var title = setup.title[this.title_key]
    return `${this.actor_name} gains ${title.rep()}`
  }
}
