/**
 * @param {boolean=} show_duty_icon 
 * @param {string} [tooltip]
 * @returns {{icon: string, title: string}}
 */
setup.Unit.prototype.busyInfo = function (show_duty_icon, tooltip) {
  let img
  let title
  if (this.getQuest()) {
    img = setup.Unit.BUSY_QUEST_URL
    title = 'on a quest'
  } else if (this.getOpportunity()) {
    img = setup.Unit.BUSY_OPPORTUNITY_URL
    title = 'on an opportunity'
  } else if (State.variables.leave.isOnLeave(this)) {
    img = setup.Unit.BUSY_LEAVE_URL
    title = 'on leave'
  } else if (this.isInjured()) {
    img = setup.Unit.BUSY_INJURY_URL
    title = 'injured'
  } else if (!this.isAvailable()) {
    // should not actually happen, but just in case
    img = setup.Unit.BUSY_OTHER_URL
    title = 'unknown'
  } else if (this.getDuty()) {
    title = 'on duty'
    if (show_duty_icon) {
      return {
        icon: this.getDuty().repIcon(),
        title: title,
      }
    } else {
      img = setup.Unit.BUSY_DUTY_URL
    }
  } else {
    img = setup.Unit.BUSY_IDLE_URL
    title = 'idle'
  }

  return {
    icon: setup.repImgIcon(img, tooltip),
    title: title,
  }
}

/**
 * @param {boolean=} show_duty_icon 
 * @returns {string}
 */
setup.Unit.prototype.repBusyState = function (show_duty_icon) {
  if (!this.isYourCompany()) return ''
  return this.busyInfo(show_duty_icon, `<<tooltipunitstatus '${this.key}'>>`).icon
}

// Same as rep, but doesn't include icons (just name + tooltip)
setup.Unit.prototype.repShort = function (text_override) {
  return (
    `<span data-tooltip="<<tooltipunit '${this.key}'>>" data-tooltip-wide>` +
    `<a class="replink">${text_override || this.getName()}</a>` +
    `</span>`
  )
}

setup.Unit.prototype.rep = function (text_override) {
  const job = this.getJob()

  // only show if either: (0. your unit, 1. in market, 2. contact, 3. retiree)
  if (
    !this.isYourCompany() &&
    !this.getMarket() &&
    !this.getContact() &&
    !this.isRetired()
  ) {
    return `<span class='rep'>${this.repBusyState()}${this.getName()}</span>`
  }

  let text = '<span class="rep">'

  if (job == setup.job.slaver) {
    text += '<div class="icongrid">'
    text += this.repBusyState(/* show duty = */ false)
    const focuses = this.getSkillFocuses(State.variables.settings.unsortedskills)
    for (let i = 0; i < focuses.length; ++i) {
      text += focuses[i].rep()
    }
    text += '</div>'
  } else {
    text += this.repBusyState(/* show duty = */ true)
    text += job.rep()
  }

  text += this.repShort(text_override)

  if (State.variables.hospital.isInjured(this)) {
    text += setup.DOM.toString(setup.DOM.Card.injury(this))
  }

  return text + '</span>'
}


/**
 * @returns {string}
 */
setup.Unit.prototype.repGender = function () {
  if (this.isSissy()) return 'sissy'
  return this.getGender().getName()
}


/**
 * Bob of Party 3
 * @returns {string}
 */
setup.Unit.prototype.repFull = function () {
  let base = `${this.rep()}`
  const party = this.getParty()
  if (party) {
    return `${base} of ${party.rep()}`
  } else {
    return base
  }
}
