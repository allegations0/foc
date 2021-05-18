
setup.qresImpl.HasSlaveWithTraits = class HasSlaveWithTraits extends setup.Restriction {
  constructor(traits) {
    super()

    if (!Array.isArray(traits)) throw new Error(`array traits for has slave with trait is not an array but ${traits}`)
    this.trait_keys = []
    for (var i = 0; i < traits.length; ++i) {
      if (!traits[i].key) throw new Error(`HasSlaveWithTraits: ${i}-th trait is missing`)
      this.trait_keys.push(traits[i].key)
    }
  }

  static NAME = 'Have at least one slave with specific traits'
  static PASSAGE = 'RestrictionHasSlaveWithTraits'

  text() {
    var res = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      res.push(`setup.trait.${this.trait_keys[i]}`)
    }
    return `setup.qres.HasSlaveWithTraits([${res.join(', ')}])`
  }


  getTraits() {
    var result = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      result.push(setup.trait[this.trait_keys[i]])
    }
    return result
  }

  explain() {
    var base = `Has slave with traits:`
    var traits = this.getTraits()
    for (var i = 0; i < traits.length; ++i) {
      base += traits[i].rep()
    }
    return base
  }

  isOk() {
    var units = State.variables.company.player.getUnits({job: setup.job.slave})
    var traits = this.getTraits()
    for (var i = 0; i < units.length; ++i) {
      var ok = true
      for (var j = 0; j < traits.length; ++j) {
        if (!units[i].isHasTrait(traits[j])) {
          ok = false
          break
        }
      }
      if (ok) return true
    }
    return false
  }
}
