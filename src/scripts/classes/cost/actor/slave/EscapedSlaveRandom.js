
// one of your non-busy slave escaped.
setup.qcImpl.EscapedSlaveRandom = class EscapedSlaveRandom extends setup.Cost {
  constructor() {
    super()

  }

  static NAME = 'A random slave escaped'
  static PASSAGE = 'CostEscapedSlaveRandom'

  text() {
    return `setup.qc.EscapedSlaveRandom()`
  }


  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var slaves = State.variables.company.player.getUnits({job: setup.job.slave, available: true})
    if (!slaves.length) return  // nobody can escape.
    var escaped = setup.rng.choice(slaves)

    if (setup.qcImpl.MissingUnit.checkMissingPlayer(escaped, quest)) return

    escaped.addHistory('escaped from your company.', quest)
    State.variables.company.player.removeUnit(escaped)
    setup.unitgroup.escapedslaves.addUnit(escaped)
  }

  undoApply(quest) {
    throw new Error(`Cannot be undone`)
  }

  explain(quest) {
    return `A random slave escaped`
  }
}
