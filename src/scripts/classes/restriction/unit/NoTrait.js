
setup.qresImpl.NoTrait = class NoTrait extends setup.Restriction {
  /**
   * @param {setup.Trait | string} trait 
   */
  constructor(trait) {
    super()

    this.trait_key = setup.keyOrSelf(trait)
  }

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
