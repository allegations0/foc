import { generateUnitName } from "../../../names/namegen"

// resets background trait to the given trait.
setup.qcImpl.GenName = class GenName extends setup.Cost {
  constructor(actor_name, name_traits) {
    super()

    this.actor_name = actor_name
    this.trait_keys = []
    let gender_found = false
    let subrace_found = false
    for (var i = 0; i < name_traits.length; ++i) {
      if (!name_traits[i].key) throw new Error(`${name_traits[i]} at ${i}-th position not found for genname`)
      this.trait_keys.push(name_traits[i].key)
      if (name_traits[i].getTags().includes('gender')) gender_found = true
      if (name_traits[i].getTags().includes('subrace')) subrace_found = true
    }
    this.gender_found = gender_found
    this.subrace_found = subrace_found
  }

  text() {
    var texts = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      texts.push(`setup.trait.${this.trait_keys[i]}`)
    }
    return `setup.qc.GenName('${this.actor_name}', [${texts.join(', ')}])`
  }

  getTraits() {
    var result = []
    for (var i = 0; i < this.trait_keys.length; ++i) {
      result.push(setup.trait[this.trait_keys[i]])
    }
    return result
  }

  apply(quest) {
    var unit = quest.getActorUnit(this.actor_name)
    var traits = this.getTraits()
    if (!this.gender_found) traits.push(unit.getGender())
    if (!this.subrace_found) traits.push(unit.getSubrace())
    var names = generateUnitName(traits)
    var oldname = unit.getFullName()
    unit.setName(names[0], names[1])
    var newname = unit.getFullName()
    unit.addHistory(` changed name from ${oldname} to ${newname}.`, quest)
  }

  explain(quest) {
    var texts = []
    var traits = this.getTraits()
    for (var i = 0; i < traits.length; ++i) {
      texts.push(traits[i].rep())
    }
    return `${this.actor_name} is name is changed to a generated on based on (${texts.join('')})`
  }
}
