
setup.qresImpl.QuestDone = class QuestDone extends setup.Restriction {
  constructor(template) {
    super()

    if (!template) throw new Error(`Missing template for QuestDone`)
    this.template_key = setup.keyOrSelf(template)
  }

  text() {
    return `setup.qres.QuestDone('${this.template_key}')`
  }

  isOk() {
    var template = setup.questtemplate[this.template_key]
    return State.variables.statistics.isHasSuccess(template)
  }

  explain() {
    var template = setup.questtemplate[this.template_key]
    return `Have ever completed quest: ${template.getName()}`
  }
}
