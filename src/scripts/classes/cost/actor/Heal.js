
setup.qcImpl.Heal = class Heal extends setup.Cost {
  constructor(actor_name, heal_amt) {
    super()

    this.actor_name = actor_name
    this.heal_amt = heal_amt
  }

  static NAME = 'Heal Unit'
  static PASSAGE = 'CostHeal'
  static UNIT = true

  text() {
    return `setup.qc.Heal('${this.actor_name}', ${this.heal_amt})`
  }


  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    State.variables.hospital.healUnit(unit, this.heal_amt)
  }

  undoApply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    State.variables.hospital.injureUnit(unit, this.heal_amt)
  }

  explain(quest) {
    return `${this.actor_name} healed by ${this.heal_amt} weeks`
  }
}
