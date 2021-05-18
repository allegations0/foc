
setup.FamilyRelation = class FamilyRelation extends setup.TwineClass {
  constructor(key, name, tags) {
    super()
    
    if (!key) throw new Error(`null key for family relation`)
    this.key = key

    if (!name) throw new Error(`null name for family relation ${key}`)
    this.name = name

    if (!Array.isArray(tags)) throw new Error(`${key} tags wrong for family relation ${tags}`)
    this.tags = tags

    if (key in setup.familyrelation) throw new Error(`Family relation ${key} duplicated`)
    setup.familyrelation[key] = this
  }

  rep() {
    return this.getName()
  }

  getName() { return this.name }

  getTags() { return this.tags }
}
