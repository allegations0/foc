
setup.qresImpl.NoOpportunity = class NoOpportunity extends setup.Restriction {
  constructor(template) {
    super()

    if (!template) throw new Error(`Missing template for NoOpportunity`)
    if (setup.isString(template)) {
      this.template_key = template
    } else {
      this.template_key = template.key
    }
  }

  text() {
    return `setup.qres.NoOpportunity('${this.template_key}')`
  }

  isOk(template_arg) {
    var template = setup.opportunitytemplate[this.template_key]
    var opportunities = State.variables.opportunitylist.getOpportunities()
    for (var i = 0; i < opportunities.length; ++i) if (opportunities[i].getTemplate() == template) return false
    return true
  }

  apply(quest) {
    throw new Error(`Not a reward`)
  }

  undoApply(quest) {
    throw new Error(`Not a reward`)
  }

  explain() {
    var template = setup.opportunitytemplate[this.template_key]
    return `No opportunity : ${template.getName()}`
  }
}
