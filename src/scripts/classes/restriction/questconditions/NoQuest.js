
setup.qresImpl.NoQuest = class NoQuest extends setup.Restriction {
  constructor(template) {
    super()

    if (!template) throw new Error(`Missing template for NoQuest`)
    this.template_key = setup.keyOrSelf(template)
  }

  static NAME = 'Do not already have or doing a particular quest'
  static PASSAGE = 'RestrictionNoQuest'

  text() {
    return `setup.qres.NoQuest('${this.template_key}')`
  }

  isOk() {
    var template = setup.questtemplate[this.template_key]
    var quests = State.variables.company.player.getQuests()
    for (var i = 0; i < quests.length; ++i) if (quests[i].getTemplate() == template) return false
    return true
  }

  apply(quest) {
    throw new Error(`Not a reward`)
  }

  undoApply(quest) {
    throw new Error(`Not a reward`)
  }

  explain() {
    var template = setup.questtemplate[this.template_key]
    return `No quest: ${template.getName()}`
  }
}
