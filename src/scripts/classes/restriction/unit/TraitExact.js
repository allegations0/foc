
setup.qresImpl.TraitExact = class TraitExact extends setup.Restriction {
  constructor(trait) {
    super()

    this.trait_key = trait.key
  }

  static NAME = 'Has a trait (exact)'
  static PASSAGE = 'RestrictionTraitExact'
  static UNIT = true

  text() {
    return `setup.qres.TraitExact(setup.trait.${this.trait_key})`
  }


  explain() {
    var trait = setup.trait[this.trait_key]
    return trait.rep()
  }

  isOk(unit) {
    var trait = setup.trait[this.trait_key]
    return unit.isHasTraitExact(trait)
  }
}
