
setup.qresImpl.Trait = class Trait extends setup.Restriction {
  constructor(trait, trait_group) {
    super()

    if (trait) {
      this.trait_key = setup.keyOrSelf(trait)
    } else {
      this.trait_key = null
    }

    if (trait_group) {
      this.trait_group_key = setup.keyOrSelf(trait_group)
    } else {
      this.trait_group_key = null
    }

    if (!this.trait_key && !this.trait_group_key) {
      throw new Error('missing trait in qres.Trait!')
    }
  }

  text() {
    if (this.trait_key) {
      return `setup.qres.Trait(setup.trait.${this.trait_key})`
    } else {
      return `setup.qres.Trait(null, setup.traitgroup[${this.trait_group_key}])`
    }
  }


  explain() {
    var trait = null
    if (this.trait_key) trait = setup.trait[this.trait_key]

    if (trait) {
      var cover = trait.getTraitCover()
      if (cover.length > 1) {
        return `(${cover.map(a => a.rep()).join(' or ')})`
      } else {
        return `${trait.rep()}`
      }
    }

    var trait_group = null
    if (this.trait_group_key) trait_group = setup.traitgroup[this.trait_group_key]

    var banlist = trait_group.getTraitCover(null, true)
    var textban = []
    for (var i = 0; i < banlist.length; ++i) {
      textban.push(banlist[i].repNegative())
    }
    return `${textban.join('')}`
  }

  isOk(unit) {
    var trait_group = null
    if (this.trait_group_key) trait_group = setup.traitgroup[this.trait_group_key]

    var trait = null
    if (this.trait_key) trait = setup.trait[this.trait_key]

    return unit.isHasTrait(trait, trait_group)
  }
}
