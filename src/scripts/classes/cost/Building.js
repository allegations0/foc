
setup.qcImpl.Building = class Building extends setup.Cost {
  constructor(building_template) {
    super()

    this.template_key = building_template.key
  }

  text() {
    return `setup.qc.Building(setup.buildingtemplate.${this.template_key})`
  }

  isOk() {
    throw new Error(`Building not a cost`)
  }

  apply(quest) {
    var template = setup.buildingtemplate[this.template_key]
    State.variables.fort.player.build(template)
  }

  undoApply() {
    throw new Error(`Building not undoable`)
  }

  explain() {
    var template = setup.buildingtemplate[this.template_key]
    return `${template.rep()}`
  }
}
