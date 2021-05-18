
setup.qresImpl.ExistUnit = class ExistUnit extends setup.Restriction {
  /**
   * @param {setup.Restriction[]} restrictions 
   * @param {number} [amount]
   */
  constructor(restrictions, amount) {
    super()

    this.restrictions = restrictions
    this.amount = amount || 1
  }

  text() {
    var texts = this.restrictions.map(a => a.text())
    return `setup.qres.ExistUnit([<br/>${texts.join(',<br/>')}<br/>], ${this.amount})`
  }

  explain() {
    var texts = this.restrictions.map(a => a.explain())
    return `Must EXIST at least ${this.amount} units with: [ ${texts.join(' ')} ]`
  }

  isOk() {
    let hits = 0
    for (var iunitkey in State.variables.unit) {
      var unit = State.variables.unit[iunitkey]
      if (setup.RestrictionLib.isUnitSatisfy(unit, this.restrictions)) hits += 1
      if (hits >= this.amount) return true
    }
    return false
  }

  getLayout() {
    return {
      css_class: "marketobjectcard",
      blocks: [
        {
          passage: "RestrictionExistUnitHeader",
          addpassage: "QGAddRestrictionUnit",
          listpath: ".restrictions"
        }
      ]
    }
  }
}
