
// Don't put to class. ItemPoolGroup can be a thing in the future.
setup.ItemPool = class ItemPool {
  constructor(key, item_chances) {
    // equip_chances: {item_key: chance}
    this.key = key
    this.item_chances = item_chances

    if (key in setup.itempool) throw new Error(`Duplicate item pool key ${key}`)
    setup.itempool[key] = this
  }

  getName() {
    return this.key
  }

  rep() {
    return setup.repMessage(this, 'itempoolcardkey')
  }

  generateItem() {
    var item_key = setup.rng.sampleObject(this.item_chances, true)
    return setup.item[item_key]
  }
}

