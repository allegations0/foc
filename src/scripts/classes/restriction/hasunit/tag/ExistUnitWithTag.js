
setup.qresImpl.ExistUnitWithTag = class ExistUnitWithTag extends setup.Restriction {
  constructor(tag_name) {
    super()

    this.tag_name = tag_name
  }

  text() {
    return `setup.qres.ExistUnitWithTag('${this.tag_name}')`
  }

  explain() {
    var tagname = this.tag_name
    return `Must EXIST any unit (anywhere in the world, not only in your company) with tag/flag: "${tagname}"`
  }

  isOk() {
    for (var iunitkey in State.variables.unit) {
      var unit = State.variables.unit[iunitkey]
      if (unit.isHasTag(this.tag_name)) return true
    }
    return false
  }
}
