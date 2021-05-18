
setup.qresImpl.HasUnitWithTitle = class HasUnitWithTitle extends setup.Restriction {
  constructor(title, params) {
    super()

    if (setup.isString(title)) {
      this.title_key = title
    } else {
      this.title_key = title.key
    }
  
    if (params) {
      this.params = params
    } else {
      this.params = {}
    }
  }

  text() {
    var paramtext = `{\n`
    for (var paramkey in this.params) {
      var paramval = this.params[paramkey]
      paramtext += `${paramkey}: `
      if (setup.isString(paramval)) {
        paramtext += `"${paramval}",\n`
      } else {
        paramtext += `${paramval},\n`
      }
    }
    paramtext += `}`
    return `setup.qres.HasUnitWithTitle('${this.title_key}', ${paramtext})`
  }

  explain() {
    var title = setup.title[this.title_key]
  
    var paramtext = []
    for (var paramkey in this.params) {
      var paramval = this.params[paramkey]
      paramtext.push(`${paramkey}: ${paramval}`)
    }
  
    return `Must exists any unit that has "${title.rep()}" and also ${paramtext.join(', ')}`
  }

  isOk() {
    var title = setup.title[this.title_key]
    var params = this.params
  
    var base = Object.values(State.variables.unit)
    if ('job_key' in params) {
      base = State.variables.company.player.getUnits({job: setup.job[params.job_key]})
    }
  
    for (var i = 0; i < base.length; ++i) {
      var unit = base[i]
      if (State.variables.titlelist.isHasTitle(unit, title)) return true
    }
    return false
  }
}
