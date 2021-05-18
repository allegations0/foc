
// removes x random traits out of these.
setup.qcImpl.DecreaseTraitsRandom = class DecreaseTraitsRandom extends setup.Cost {
  constructor(actor_name, traits, no_of_traits, is_replace) {
    super()

    this.actor_name = actor_name
    if (!Array.isArray(traits)) throw new Error(`Trait array must be array`)
    if (no_of_traits > traits.length) throw new Error(`Too few traits: ${traits.length} vs ${no_of_traits}`)
    this.trait_keys = traits.map(a => a.key)
    this.no_of_traits = no_of_traits
    this.is_replace = is_replace
  }

  text() {
    var texts = this.trait_keys.map(a => `setup.trait.${a}`)
    return `setup.qc.DecreaseTraitsRandom('${this.actor_name}', [${texts.join(', ')}], ${this.no_of_traits}, ${this.is_replace})`
  }

  getTraits() {
    return this.trait_keys.map(a => setup.trait[a])
  }

  apply(quest) {
    /**
     * @type {setup.Unit}
     */
    var unit = quest.getActorUnit(this.actor_name)
    var traits = this.getTraits()
    setup.rng.shuffleArray(traits)
    var removed = 0
    var to_remove = []
    for (var i = 0; i < traits.length; ++i) {
      if (unit.isHasRemovableTrait(traits[i])) {
        to_remove.push(traits[i])
        removed += 1
        if (removed >= this.no_of_traits) break
      }
    }
    for (var i = 0; i < to_remove.length; ++i) {
      var trait = to_remove[i]
      if (this.is_replace) {
        unit.removeTraitExact(trait)
      } else {
        var trait_group = trait.getTraitGroup()
        if (trait_group) {
          unit.addTrait(/* trait = */ null, trait_group)
        } else {
          unit.removeTraitExact(trait)
        }
      }
      if (unit.isYourCompany()) {
        setup.notify(`a|Rep a|lose ${trait.rep()}`, {a: unit})
      }
    }
  }

  explain(quest) {
    var trait_strs = this.getTraits().map(a => a.rep())
    var uverb = 'decreases'
    if (this.is_replace) uverb = 'LOSES'
    var verb = `${uverb} ${this.no_of_traits} random traits from`
    return `${this.actor_name} ${verb} ${trait_strs.join('')}`
  }
}
