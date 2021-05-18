
setup.qcImpl.TraitIncreaseExisting = class TraitIncreaseExisting extends setup.Cost {
  /**
   * @param {string} actor_name 
   * @param {setup.Trait | string} raw_trait 
   */
  constructor(actor_name, raw_trait) {
    super()

    // decrease trait into the given trait.

    this.actor_name = actor_name
  
    const trait = setup.selfOrObject(raw_trait, setup.trait)
    if (!trait.getTraitGroup()) throw new Error(`Trait ${trait.key} does not have a trait group and cannot be decreased`)
    this.trait_key = trait.key
  }

  text() {
    return `setup.qc.TraitIncreaseExisting('${this.actor_name}', setup.trait.${this.trait_key})`
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    var trait = setup.trait[this.trait_key]
    var trait_group = trait.getTraitGroup()
    var lowest_trait = trait_group.getSmallestTrait()
    if (unit.isHasRemovableTrait(lowest_trait, /* include cover = */ true)) {
      var added = unit.addTrait(trait)
      if (added) unit.addHistory(`gained ${added.rep()}.`, quest)
    }
  }

  explain(quest) {
    return `${this.actor_name}'s trait (if any) increases to max. ${setup.trait[this.trait_key].rep()}`
  }
}
