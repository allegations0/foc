
/**
 * Corrupt a random unit at home
 */
setup.qcImpl.CorruptRandomUnitHome = class CorruptRandomUnitHome extends setup.Cost {
  constructor() {
    super()
  }

  text() {
    return `setup.qc.CorruptRandomUnitHome()`
  }

  /**
   * @param {any} quest 
   */
  apply(quest) {
    var units = State.variables.company.player.getUnits({home: true})
    if (!units.length) return
    var chosen = setup.rng.choice(units)
    setup.qc.Corrupt('unit').apply(setup.costUnitHelper(chosen))
  }

  /**
   * @param {*} quest 
   */
  explain(quest) {
    return `Corrupt a random unit in your company`
  }
}
