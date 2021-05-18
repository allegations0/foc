setup.qresImpl.QuestOnCooldown = class QuestOnCooldown extends setup.Restriction {
  constructor(template) {
    super()

    if (!template) throw new Error(`Missing template for QuestOnCooldown`)
    this.template_key = setup.keyOrSelf(template)
  }

  text() {
    return `setup.qres.QuestOnCooldown('${this.template_key}')`
  }

  isOk() {
    var template = setup.questtemplate[this.template_key]
    return State.variables.calendar.isOnCooldown(template)
  }

  explain() {
    var template = setup.questtemplate[this.template_key]
    return `Quest on cooldown: ${template.getName()}`
  }
}
