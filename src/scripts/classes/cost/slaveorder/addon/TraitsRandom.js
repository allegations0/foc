
setup.SlaveOrderAddonImpl.TraitsRandom = class TraitsRandom extends setup.SlaveOrderAddonBase {
  constructor(traits, num_crit, num_disaster, num_restriction) {
    super()

    if (traits.length < num_crit + num_disaster + num_restriction) {
      throw new Error(`Too few traits for TraitsRandom: ${traits} for ${num_crit} crit ${num_disaster} disaster ${num_restriction} restriction`)
    }
    this.trait_keys = traits.map(a => a.key)
    this.num_crit = num_crit
    this.num_disaster = num_disaster
    this.num_restriction = num_restriction
  }

  text() {
    var texts = this.trait_keys.map(a => `setup.trait.${a}`)
    return `setup.SlaveOrderAddon.TraitsRandom([<br/>${texts.join(',<br/>')}<br/>], ${this.num_crit}, ${this.num_disaster}, ${this.num_restriction})`
  }

  explain() {
    var traits = this.trait_keys.map(a => setup.trait[a].rep())
    return `Randomly: select ${this.num_crit} critical, ${this.num_disaster} disaster, and ${this.num_restriction} must-have traits from ${traits.join('')}`
  }


  apply(slave_order) {
    var traits = this.trait_keys.map(a => setup.trait[a])
    setup.rng.shuffleArray(traits)
    var criteria = slave_order.criteria
    for (var i = 0; i < this.num_crit; ++i) {
      var totraits = traits[i].getTraitCover()
      for (var j = 0; j < totraits.length; ++j) {
        criteria.crit_trait_map[totraits[j].key] = true
      }
    }
    for (var i = 0; i < this.num_disaster; ++i) {
      var totraits = traits[this.num_crit + i].getTraitCover()
      for (var j = 0; j < totraits.length; ++j) {
        criteria.disaster_trait_map[totraits[j].key] = true
      }
    }
    for (var i = 0; i < this.num_restriction; ++i) {
      criteria.restrictions.push(setup.qres.Trait(traits[this.num_crit + this.num_disaster + i]))
    }
  }
}
