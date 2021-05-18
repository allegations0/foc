
setup.qresImpl.NoTrait = class NoTrait extends setup.Restriction {
  constructor(trait) {
    super()

    this.trait_key = setup.keyOrSelf(trait)
  }

  static NAME = 'Do NOT have a trait'
  static PASSAGE = 'RestrictionNoTrait'
  static UNIT = true

  text() {
    return `setup.qres.NoTrait(setup.trait.${this.trait_key})`
  }


  explain() {
    var trait = setup.trait[this.trait_key]
    var cover = [trait]
    if (trait.getTraitGroup()) {
      cover = trait.getTraitGroup().getTraitCover(setup.trait[this.trait_key])
    }
    var text = ''
    for (var i = 0; i < cover.length; ++i) {
      text += cover[i].repNegative()
    }
    return text
  }

  isOk(unit) {
    var trait = setup.trait[this.trait_key]
    return !unit.isHasTrait(trait)
  }
}
