setup.qresImpl.EventOnCooldown = class EventOnCooldown extends setup.Restriction {
  constructor(template) {
    super()

    if (!template) throw new Error(`Missing template for EventOnCooldown`)
    this.template_key = setup.keyOrSelf(template)
  }

  text() {
    return `setup.qres.EventOnCooldown('${this.template_key}')`
  }

  isOk() {
    var template = setup.event[this.template_key]
    return State.variables.calendar.isOnCooldown(template)
  }

  explain() {
    var template = setup.event[this.template_key]
    return `Event on cooldown: ${template.getName()}`
  }
}
