
setup.TITLE_MAX_ASSIGNED = 2

// special. Will be assigned to State.variables.titlelist

setup.TitleList = class TitleList extends setup.TwineClass {
  // arglist
  constructor() {
    super()

    // ALL titles:
    // unit: {title1key: true, title2key: true}
    this.titles = {}

    // ASSIGNED titles: (only these have gameplay effects)
    // unit: [title1assigned, title2assigned]
    this.assigned = {}

    // last obtained title, if any.
    this.last_obtained = {}
  }

  deleteUnit(unit) {
    var unitkey = unit.key
    if (unitkey in this.titles) delete this.titles[unitkey]
    if (unitkey in this.assigned) delete this.assigned[unitkey]
    if (unitkey in this.last_obtained) delete this.last_obtained[unitkey]
  }

  addTitle(unit, title) {
    if (!title.key) throw new Error(`Missing title for addTitle ${title}`)
    var unitkey = unit.key
    if (!(unitkey in this.titles)) this.titles[unitkey] = {}
    this.titles[unitkey][title.key] = true

    if (!(unitkey in this.last_obtained)) this.last_obtained[unitkey] = {}
    this.last_obtained[unitkey] = title.key

    /* if has space, add it */
    if (this.isCanAssignTitle(unit, title)) {
      this.assignTitle(unit, title)
    }

    unit.resetCache()
  }

  getLastTitle(unit) {
    if (!(unit.key in this.last_obtained)) return null
    var titlekey = this.last_obtained[unit.key]
    if (!titlekey) return null
    return setup.title[titlekey]
  }

  removeTitle(unit, title) {
    var unitkey = unit.key
    if (!(unitkey in this.titles)) return
    if (!(title.key in this.titles[unitkey])) return
    delete this.titles[unitkey][title.key]

    if (title == this.getLastTitle(unit)) {
      delete this.last_obtained[unit.key]
    }

    this.unassignTitle(unit, title, /* should_replace = */ true)

    unit.resetCache()
  }

  _setAssigned(unit) {
    if (!(unit.key in this.assigned)) {
      this.assigned[unit.key] = []
    }
  }

  isCanAssignTitle(unit, title) {
    var assigned = this.getAssignedTitles(unit, /* is base only = */ true)

    if (assigned.length >= setup.TITLE_MAX_ASSIGNED) return false
    if (assigned.includes(title)) return false

    return true
  }

  assignTitle(unit, title) {
    if (!this.isHasTitle(unit, title)) throw new Error(`unit ${unit.key} missing title ${title.key}`)
    this._setAssigned(unit)
    var assigned = this.assigned[unit.key]
    if (assigned.length >= setup.TITLE_MAX_ASSIGNED) throw new Error(`unit already has too many titles`)
    if (assigned.includes(title.key)) throw new Error(`unit already have title ${title.key}`)
    assigned.push(title.key)

    unit.resetCache()
  }

  unassignTitle(unit, title, should_replace) {
    this._setAssigned(unit)
    if (this.assigned[unit.key].includes(title.key)) {
      this.assigned[unit.key] = this.assigned[unit.key].filter(a => a != title.key)

      if (should_replace) {
        // find replacement
        var candidates = this.getAllTitles(unit).filter(title => !this.assigned[unit.key].includes(title.key))
        if (candidates.length) {
          var replacement = setup.rng.choice(candidates)
          this.assignTitle(unit, replacement)
        }
      }
    }

    unit.resetCache()
  }

  getAllTitles(unit) {
    if (!(unit.key in this.titles)) return []
    return Object.keys(this.titles[unit.key]).map(titlekey => setup.title[titlekey])
  }

  /**
   * @param {setup.Unit} unit 
   * @param {setup.Title | string} title 
   */
  isHasTitle(unit, title) {
    let actual_title
    if (setup.isString(title)) {
      // @ts-ignore
      if (!(title in setup.title)) throw new Error(`Unknown title ${title}`)
      // @ts-ignore
      actual_title = setup.title[title]
    } else {
      actual_title = title
    }
    if (!(unit.key in this.titles)) return false
    return actual_title.key in this.titles[unit.key]
  }

  getAssignedTitles(unit, is_base_only) {
    var assigned = []
    if (unit.key in this.assigned) {
      assigned = this.assigned[unit.key].map(titlekey => setup.title[titlekey])
    }

    if (!is_base_only) {
      // last obtained title is always included
      var last = this.getLastTitle(unit)
      if (last && !assigned.includes(last)) assigned.push(last)
    }
    return assigned
  }
}
