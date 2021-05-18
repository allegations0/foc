
setup.qcImpl.TraitsReplace = class TraitsReplace extends setup.Cost {
  constructor(actor_name, traits) {
    super()

    this.actor_name = actor_name
    this.trait_keys = []
    if (!Array.isArray(traits)) throw new Error(`Trait array must be array`)
    for (var i = 0; i < traits.length; ++i) this.trait_keys.push(traits[i].key)
  }

  static NAME = 'Gain Traits (replacing old ones)'
  static PASSAGE = 'CostTraitsReplace'

  text() {
    var texts = this.trait_keys.map(a => `setup.trait.${a}`)
    return `setup.qc.TraitsReplace('${this.actor_name}', [${texts.join(', ')}])`
  }

  getTraits() {
    var result = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      result.push(setup.trait[this.trait_keys[i]])
    }
    return result
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    var traits = this.getTraits()
    for (var i = 0; i < traits.length; ++i) {
      if (unit.isTraitCompatible(traits[i])) {
        unit.addTrait(traits[i], /* group = */ null, /* replace = */ true)
      }
    }
  }

  explain(quest) {
    var traits = this.getTraits()
    var trait_strs = []
    for (var i = 0; i < traits.length; ++i) trait_strs.push(traits[i].rep())
    return `${this.actor_name} gain (forcefully) ${trait_strs.join('')}`
  }
}
