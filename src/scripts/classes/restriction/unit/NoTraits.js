
setup.qresImpl.NoTraits = class NoTraits extends setup.Restriction {
  constructor(traits, is_exact) {
    super()

    this.trait_keys = []
    for (var i = 0; i < traits.length; ++i) {
      var trait = traits[i]
      this.trait_keys.push(trait.key)
    }
  
    this.is_exact = is_exact
  }

  text() {
    var trait_texts = this.trait_keys.map(a => `setup.trait.${a}`)
    return `setup.qres.NoTraits([${trait_texts.join(', ')}], ${this.is_exact})`
  }

  explain() {
    var traittext = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      var trait = setup.trait[this.trait_keys[i]]
      if (this.is_exact) {
        traittext.push(trait.repNegative())
      } else {
        var cover = trait.getTraitCover()
        for (var j = 0; j < cover.length; ++j) {
          traittext.push(cover[j].repNegative())
        }
      }
    }
    return traittext.join('')
  }

  isOk(unit) {
    var traits = unit.getTraits()
    for (var i = 0; i < this.trait_keys.length; ++i) {
      var trait_key = this.trait_keys[i]
      if (this.is_exact) {
        if (traits.includes(setup.trait[trait_key])) return false
      } else {
        if (unit.isHasTrait(setup.trait[trait_key])) return false
      }
    }
    return true
  }
}
