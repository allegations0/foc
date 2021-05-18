// effects: [cost1, cost2, cost3, ...]
// actor name is: 'unit'
setup.ItemUnitUsable = class ItemUnitUsable extends setup.Item {
  /**
   * @param {{
   * key: string
   * name: string
   * description: string
   * value: number
   * unit_restrictions: setup.Restriction[]
   * effects: setup.Cost[]
   * tags: string[]
   * }} args
   */
  constructor({ key, name, description, value, unit_restrictions, effects, tags }) {
    super({
      key: key,
      name: name,
      description: description,
      item_class: setup.itemclass.usableitem,
      value: value,
      tags: tags,
    })

    // who can this be used on?
    this.unit_restrictions = unit_restrictions

    // whats the effect?
    this.effects = effects
  }

  getActorUnit(actor_name) {
    if (actor_name != 'unit') throw new Error(`Unknown actor name ${actor_name}`)
    if (!this.temporary_unit_key) throw new Error(`temporary unit not set`)
    return State.variables.unit[this.temporary_unit_key]
  }

  isUsable() {
    return true
  }

  isUsableOn(unit) {
    return setup.RestrictionLib.isUnitSatisfyIncludeDefiancy(unit, this.unit_restrictions)
  }

  use(unit) {
    this.temporary_unit_key = unit.key
    setup.RestrictionLib.applyAll(this.effects, this)
    delete this.temporary_unit_key

    // remove item from inventory after use.
    State.variables.inventory.removeItem(this)
  }

}
