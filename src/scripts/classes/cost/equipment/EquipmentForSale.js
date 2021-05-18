
setup.qcImpl.EquipmentForSale = class EquipmentForSale extends setup.Cost {
  /**
   * @param {setup.Market | string} market 
   * @param {setup.EquipmentPool | string} equipment_pool 
   * @param {number} amount 
   * @param {number} [markup]
   */
  constructor(market, equipment_pool, amount, markup) {
    super()

    if (!market) throw new Error(`Missing market in equipmentforsale`)
    if (!equipment_pool) throw new Error(`Missing equipment pool for equipment for sale in ${market}`)

    this.equipment_pool_key = setup.keyOrSelf(equipment_pool)
    this.market_key = setup.keyOrSelf(market)
    this.markup = markup || 1.0

    if (!amount) {
      this.amount = 1
    } else {
      this.amount = amount
    }
  }

  text() {
    return `setup.qc.EquipmentForSale('${this.market_key}', '${this.equipment_pool_key}', ${this.amount}, ${this.markup})`
  }

  apply(quest) {
    var market = this.getMarket()
    var pool = setup.equipmentpool[this.equipment_pool_key]
    for (var i = 0; i < this.amount; ++i) {
      var equipment = pool.generateEquipment()
      new setup.MarketObject(
        equipment,
        /* price = */ Math.round(equipment.getValue() * this.markup),
        setup.MARKET_OBJECT_EQUIPMENT_EXPIRATION,
        market,
        quest,
      )
    }
  }

  getMarket() { return State.variables.market[this.market_key] }

  explain(quest) {
    return `${this.amount} new items in ${this.getMarket().rep()} at ${this.markup}x price`
  }
}
