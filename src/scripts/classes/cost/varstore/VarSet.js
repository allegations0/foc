
setup.qcImpl.VarSet = class VarSet extends setup.Cost {
  constructor(key, value, expires) {
    super()

    this.key = key
    this.value = value
    this.expires = expires
    if (expires === undefined) throw new Error(`Undefined expiration for VarSet`)
  }

  static NAME = 'Set a variable value'
  static PASSAGE = 'CostVarSet'

  text() {
    if (setup.isString(this.value)) {
      return `setup.qc.VarSet('${this.key}', '${this.value}', ${this.expires})`
    } else {
      return `setup.qc.VarSet('${this.key}', ${this.value}, ${this.expires})`
    }
  }

  apply(quest) {
    State.variables.varstore.set(this.key, this.value, this.expires)
  }

  explain(quest) {
    if (quest) return ''
    return `Variable "${this.key}" is set to "${this.value}" for ${this.expires} weeks.`
  }
}
