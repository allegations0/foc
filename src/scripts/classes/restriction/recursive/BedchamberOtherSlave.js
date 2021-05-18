
setup.qresImpl.BedchamberOtherSlave = class BedchamberOtherSlave extends setup.Restriction {
  constructor(restriction) {
    super()

    this.restriction = restriction
  }

  text() {
    return `setup.qres.BedchamberOtherSlave(${this.restriction.text()})`
  }

  explain(quest) {
    return `The other slave in bedchamber satisfies: (${this.restriction.explain(quest)})`
  }

  isOk(unit) {
    if (!unit.isSlave()) return false
    var bedchamber = unit.getBedchamber()
    if (!bedchamber) return false
    var slaves = bedchamber.getSlaves()
    if (slaves.length < 2) return false
    var targ = slaves[0]
    if (targ == unit) targ = slaves[1]
    return this.restriction.isOk(targ)
  }

  getLayout() {
    return {
      css_class: "marketobjectcard",
      blocks: [
        {
          passage: "RestrictionBedchamberOtherSlaveHeader",
          addpassage: "QGAddRestrictionUnit",
          entrypath: ".restriction"
        }
      ]
    }
  }
}
