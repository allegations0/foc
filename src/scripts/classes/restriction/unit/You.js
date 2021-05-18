
setup.qresImpl.You = class You extends setup.Restriction {
  constructor() {
    super()

  }

  static NAME = 'Unit must be the player character (i.e., can only be used on you)'
  static PASSAGE = 'RestrictionYou'
  static UNIT = true

  text() {
    return `setup.qres.You()`
  }

  explain() {
    return `Unit must be you`
  }

  isOk(unit) {
    return unit == State.variables.unit.player
  }
}
