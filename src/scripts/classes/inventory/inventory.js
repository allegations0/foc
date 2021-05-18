
// special. Will be assigned to State.variables.inventory
export class Inventory extends setup.TwineClass {
  constructor() {
    super()
    this.itemkey_quantity_map = {}   // eg. {'apple': 3}
  }

  /**
   * @param {setup.Item} item 
   */
  addItem(item) {
    State.variables.statistics.add('items_obtained', 1)
    State.variables.statistics.acquireItem(item)

    var itemkey = item.key
    if (!(itemkey in this.itemkey_quantity_map)) {
      this.itemkey_quantity_map[itemkey] = 0
    }
    this.itemkey_quantity_map[itemkey] += 1

    setup.notify(`Obtained ${item.rep()}`)
  }

  removeItem(item) {
    State.variables.statistics.add('items_lost', 1)

    var itemkey = item.key
    var quantity = this.itemkey_quantity_map[itemkey]
    if (quantity < 1) throw new Error(`Inventory bugged?`)
    if (quantity == 1) {
      delete this.itemkey_quantity_map[itemkey]
    } else {
      this.itemkey_quantity_map[itemkey] -= 1
    }
    setup.notify(`Lost ${item.rep()}`)
  }

  sell(item) {
    State.variables.statistics.add('items_sold', 1)

    State.variables.company.player.addMoney(item.getSellValue())
    this.removeItem(item)
  }

  /**
   * @param {setup.Item | string} item 
   * @returns {boolean}
   */
  isHasItem(item) {
    return (setup.selfOrObject(item, setup.item).key in this.itemkey_quantity_map)
  }

  /**
   * Whether this item exists somewhere, either in the inventory or as a furniture used in a bedchamber.
   * @param {setup.Item} item 
   * @returns {boolean}
   */
  isHasItemAnywhere(item) {
    if (this.isHasItem(item)) return true
    if (item instanceof setup.Furniture) {
      for (const bedchamber of State.variables.bedchamberlist.getBedchambers()) {
        if (bedchamber.isHasFurniture(item)) return true
      }
    }
    return false
  }

  /**
   * @param {setup.Item} item 
   * @returns {number}
   */
  countItem(item) {
    if (!this.isHasItem(item)) return 0
    return this.itemkey_quantity_map[item.key]
  }

  /**
   * @returns {Array<{item: setup.Item, quantity: number}>}
   */
  getItems() {
    const result = []
    for (var itemkey in this.itemkey_quantity_map) {
      result.push({ item: setup.item[itemkey], quantity: this.itemkey_quantity_map[itemkey] })
    }
    result.sort((a, b) => setup.Item.Cmp(a.item, b.item))
    return result
  }

  /**
   * Whether the inventory has any item of this class
   * @param {setup.ItemClass} item_class 
   */
  isHasItemWithItemClass(item_class) {
    return this.getItems().filter(item_obj => item_obj.item.getItemClass() == item_class).length
  }
}
setup.Inventory = Inventory
