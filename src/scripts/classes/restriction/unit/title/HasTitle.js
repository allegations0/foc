
setup.qresImpl.HasTitle = class HasTitle extends setup.Restriction {
  constructor(title) {
    super()

    if (setup.isString(title)) {
      this.title_key = title
    } else {
      this.title_key = title.key
    }
  }

  text() {
    return `setup.qres.HasTitle('${this.title_key}')`
  }

  explain() {
    var title = setup.title[this.title_key]
    return `${title.rep()}`
  }

  isOk(unit) {
    var title = setup.title[this.title_key]
    return State.variables.titlelist.isHasTitle(unit, title)
  }
}
