setup.Item_keygen = 1

setup.Item = class Item extends setup.TwineClass {
  /**
   * @param {{
   * key: string,
   * name: string,
   * description: string,
   * item_class: setup.ItemClass,
   * tags: string[],
   * value?: number | null,
   * }} args
   */
  constructor({ key, name, description, item_class, value, tags }) {
    super()
    if (!key) {
      throw new Error(`Missing key for item`)
    }
    this.key = key

    this.order_key = setup.Item_keygen
    setup.Item_keygen += 1

    this.name = name
    this.description = description

    this.itemclass_key = item_class.key
    this.value = value

    if (!Array.isArray(tags)) throw new Error(`Missing array tag for item ${key}`)
    this.tags = tags

    if (!this.itemclass_key) throw new Error(`Define item_class_key`)

    if (key in setup.item) throw new Error(`Duplicate item key ${key}`)
    setup.item[key] = this
  }

  delete() { delete setup.item[this.key] }

  /**
   * @returns {string[]}
   */
  getTags() { return this.tags }

  _getRarityCssClass() {
    const value = this.getValue()
    if (value >= setup.ITEM_PRICE_MASTER)
      return "rarity-legendary"
    else if (value >= setup.ITEM_PRICE_GOOD)
      return "rarity-epic"
    else if (value >= setup.ITEM_PRICE_NORMAL)
      return "rarity-rare"
    else
      return "rarity-common"
  }

  getImageRep() {
    const image_path_raw = this.getItemClass().getImage()
    const tooltip = `<<itemcardkey '${this.key}'>>`
    const url = setup.escapeHtml(setup.resolveImageUrl(image_path_raw))
    let classes = this._getRarityCssClass()
    return `<span class="trait ${classes}" data-tooltip="${tooltip}"><img src="${url}"/></span>`
  }

  /**
   * @returns {string}
   */
  rep() {
    return setup.repMessageDict({
      instance: this,
      macroname: 'itemcardkey',
      icontext: this.getImageRep(),
      text_class: `text-${this._getRarityCssClass()}`
    })
  }

  // how many do you have?
  getOwnedNumber() {
    return State.variables.inventory.countItem(this)
  }

  getItemClass() {
    return setup.itemclass[this.itemclass_key]
  }

  getName() {
    return this.name
  }

  // if 0 or null then item does not have any value
  getValue() {
    return this.value
  }

  // if 0 or null then item cannot be sold
  getSellValue() {
    return Math.floor(this.getValue() * setup.MONEY_SELL_MULTIPLIER)
  }

  getDescription() {
    return this.description
  }

  isUsable() {
    return false
  }

  isAvailableInAlchemistShop() {
    const ITEM_CLASS_IN_ALCHEMIST_SHOP = [
      'usableitem',
      'notusableitem',
      'usablefreeitem',
    ]

    if (!ITEM_CLASS_IN_ALCHEMIST_SHOP.includes(this.getItemClass().key)) {
      return false
    }

    return true
  }

  /**
   * @param {setup.Item} item1 
   * @param {setup.Item} item2 
   */
  static Cmp(item1, item2) {
    return item1.order_key - item2.order_key
  }
}
