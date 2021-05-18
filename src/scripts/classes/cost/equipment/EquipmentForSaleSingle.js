
setup.qcImpl.EquipmentForSaleSingle = class EquipmentForSaleSingle extends setup.Cost {
  /**
   * 
   * @param {setup.Market | string} market 
   * @param {setup.Equipment | string} equipment 
   */
  constructor(market, equipment) {
    super()

    if (!market) throw new Error(`Missing market in equipmentforsale`)
    if (!equipment) throw new Error(`Missing equipment for equipment for sale in ${market}`)

    this.equipment_key = setup.keyOrSelf(equipment)
    this.market_key = setup.keyOrSelf(market)
  }

  isOk(quest) {
    throw new Error(`Reward only`)
  }

  apply(quest) {
    const market = this.getMarket()
    const equipment = setup.equipment[this.equipment_key]
    new setup.MarketObject(
      equipment,
      /* price = */ equipment.getValue(),
      setup.MARKET_OBJECT_EQUIPMENT_EXPIRATION,
      market,
      quest,
    )
  }

  undoApply(quest) {
    throw new Error(`Can't undo`)
  }

  getMarket() { return State.variables.market[this.market_key] }

  explain(quest) {
    const equipment = setup.equipment[this.equipment_key]
    return `${this.getMarket().rep()} now sells ${equipment.rep()}`
  }
}
