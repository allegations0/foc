
setup.qcImpl.VarAdd = class VarAdd extends setup.Cost {
  constructor(key, value, expires) {
    super()

    this.key = key
    this.value = value
    this.expires = expires
  }

  static NAME = 'Add a variable value (set it to 0 if it does not exists)'
  static PASSAGE = 'CostVarAdd'

  text() {
    return `setup.qc.VarAdd('${this.key}', ${this.value}, ${this.expires})`
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    var existing = State.variables.varstore.get(this.key) || 0
    State.variables.varstore.set(this.key, existing + this.value, this.expires)
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  explain(quest) {
    if (quest) return ''
    return `Variable "${this.key}" is added by "${this.value}" and reset expiration to ${this.expires} weeks.`
  }
}
