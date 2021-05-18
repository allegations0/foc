
// special. Will be assigned to State.variables.varstore
setup.VarStore = class VarStore extends setup.TwineClass {
  constructor() {
    super()

    // key: value
    this.vars = {}

    // key: deadline
    this.vars_deadline = {}
  }

  set(key, value, deadline) {
    // if deadline is 0 or negative, will never expires.
    this.vars[key] = value
    this.vars_deadline[key] = deadline
  }

  get(key) {
    if (!(key in this.vars)) return null
    return this.vars[key]
  }

  remove(key) {
    if (key in this.vars) {
      delete this.vars[key]
      if (!(key in this.vars_deadline)) throw new Error(`${key} not found in vars deadline`)
      delete this.vars_deadline[key]
    }
  }

  advanceWeek() {
    var keys = Object.keys(this.vars_deadline)
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
      this.vars_deadline[key] -= 1
      if (!this.vars_deadline[key]) {
        this.remove(key)
      }
    }
  }

}
