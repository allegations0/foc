
setup.qresImpl.AnyTrait = class AnyTrait extends setup.Restriction {
  /**
   * 
   * @param {Array.<setup.Trait>} traits 
   * @param {boolean} [is_exact]
   */
  constructor(traits, is_exact) {
    super()

    if (!Array.isArray(traits)) throw new Error(`traits must be array in AnyTrait`)
    this.trait_keys = traits.map(trait => setup.keyOrSelf(trait))
    this.is_exact = !!is_exact
  }

  text() {
    var trait_texts = this.trait_keys.map(a => `setup.trait.${a}`)
    return `setup.qres.AnyTrait([${trait_texts.join(', ')}], ${this.is_exact})`
  }


  explain() {
    var res = 'Any of: '
    var traittext = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      var trait = setup.trait[this.trait_keys[i]]
      if (this.is_exact) {
        traittext.push(trait.rep())
      } else {
        for (const tc of trait.getTraitCover()) {
          traittext.push(tc.rep())
        }
      }
    }
    return res + traittext.join('')
  }

  isOk(unit) {
    for (var i = 0; i < this.trait_keys.length; ++i) {
      var trait_key = this.trait_keys[i]
      if (this.is_exact) {
        if (unit.isHasTraitExact(setup.trait[trait_key])) return true
      } else {
        if (unit.isHasTrait(setup.trait[trait_key])) return true
      }
    }
    return false
  }
}
