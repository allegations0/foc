// schedules an event that will trigger in {weeks} weeks. 0 = will trigger same week.
setup.qcImpl.Event = class Event extends setup.Cost {
  constructor(template, weeks, default_assignment) {
    super()

    if (!template) throw new Error(`Missing event for Event`)

    this.template_key = setup.keyOrSelf(template)
    this.weeks = weeks
    this.default_assignment = default_assignment
  }

  text() {
    const assignment_text = setup.qcImpl.QuestDirect.assignmentTextHelper(this.default_assignment)
    return `setup.qc.Event('${this.template_key}', ${this.weeks}, ${assignment_text})`
  }

  apply(quest) {
    const template = setup.event[this.template_key]
    const default_assignment = setup.qcImpl.QuestDirect.getDefaultAssignment(
      this.default_assignment,
      quest
    )
    State.variables.eventpool.scheduleEvent(
      template,
      State.variables.calendar.getWeek() + this.weeks,
      default_assignment
    )
  }

  explain() {
    const assignment_text = setup.qcImpl.QuestDirect.assignmentExplainHelper(this.default_assignment)
    var template = setup.event[this.template_key]
    if (!template) throw new Error(`Event ${this.template_key} is missing`)
    return `In ${this.weeks} weeks, trigger event: ${template.getName()} ${assignment_text}`
  }
}
