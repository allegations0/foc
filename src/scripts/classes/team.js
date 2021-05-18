import { generateTeamName } from "../names/namegen"

setup.Team = class Team extends setup.TwineClass {
  constructor() {
    super()

    this.key = State.variables.Team_keygen
    State.variables.Team_keygen += 1

    this.name = `Team ${generateTeamName()}`
    this.unit_keys = []
    this.quest_key = null

    if (this.key in State.variables.team) throw new Error(`Team ${this.key} duplicated`)
    State.variables.team[this.key] = this
  }

  delete() {
    delete State.variables.team[this.key]
  }
  
  checkDelete() {
    setup.queueDelete(this, 'team')
  }

  /**
   * Is the team busy somehow?
   * 
   * @returns {boolean}
   */
  isBusy() {
    if (this.quest_key) return true

    var units = this.getUnits()
    for (var i = 0; i < units.length; ++i) {
      var unit = units[i]
      if (!unit.isAvailable()) return true
    }

    return false
  }

  isReady() {
    if (this.isBusy()) return false

    // check if it has at least three slavers
    var slavercount = 0
    var units = this.getUnits()
    for (var i = 0; i < units.length; ++i) {
      if (units[i].isSlaver()) ++slavercount
    }
    return slavercount >= 3
  }

  rep() {
    return setup.repMessage(this, 'teamcardkey')
  }

  getName() {
    return this.name
  }

  /**
   * 
   * @param {setup.QuestInstance} quest 
   */
  setQuest(quest) {
    // assign this team to the quest. should never be called outside of
    // setup.QuestInstance::assignTeam()
    // This method is responsible for taking care of this team's inside.

    if (this.quest_key) throw new Error(`Team already have a quest`)
    this.quest_key = quest.key

    var units = this.getUnits()
    for (var i = 0; i < units.length; ++i) {
      var unit = units[i]
      if (unit.quest_key || unit.opportunity_key) throw new Error(`Unit already associated with a quest or opportunity`)
      // if (!unit.isAvailable()) throw new Error(`Unit is not available`)
      unit.quest_key = quest.key
    }

  }


  removeQuest(quest) {
    // remove this team from the quest. should never be called outside of
    // setup.QuestInstance::assignTeam()
    // This method is responsible for taking care of this team's inside.

    if (!this.quest_key) throw new Error(`Team does not have a quest`)
    if (this.quest_key != quest.key) throw new Error(`Wrong quest`)

    this.quest_key = null
    var units = this.getUnits()

    for (var i = 0; i < units.length; ++i) {
      var unit = units[i]
      if (!unit.quest_key) throw new Error(`Unit not on a quest`)
      if (unit.quest_key != quest.key) throw new Error(`Wrong quest`)
      unit.quest_key = null
    }
  }


  addUnit(unit) {
    if (unit.getTeam()) throw new Error(`${unit.name} already in team ${unit.team_key}`)
    this.unit_keys.push(unit.key)
    unit.team_key = this.key
  }

  _removeUnitAssociation(unit) {
    if (unit.team_key == this.key) {
      unit.team_key = null
    }
  }

  removeUnit(unit) {
    if (!this.unit_keys.includes(unit.key)) throw new Error(`${unit.name} not in this team`)
    this.unit_keys = this.unit_keys.filter(item => item != unit.key)

    this._removeUnitAssociation(unit)
  }

  /**
   * remove units from this team in one direction.
   * May be called multiple times, so should do it carefully.
   * This is done this way because on quest outcome, the units are first unset so that the team
   * still exists, before later the team is probably disbanded.
   * 
   * This means that a unit can become unset from a team, set to a different team, and then the original
   * team is disbanded.
   */
  unsetUnits() {
    for (const unit of this.getUnits()) {
      this._removeUnitAssociation(unit)
    }
  }

  disband() {
    for (const unit of this.getUnits()) {
      this.removeUnit(unit)
    }
    State.variables.company.player.removeTeam(this)
    this.checkDelete()
  }

  /**
   * @returns {Array.<setup.Unit>}
   */
  getUnits() {
    return this.unit_keys.map(key => State.variables.unit[key])
  }

  getQuest() {
    return State.variables.questinstance[this.quest_key]
  }

}
