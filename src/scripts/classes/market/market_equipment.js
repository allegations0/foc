
setup.MarketEquipment = class MarketEquipment extends setup.Market {
  constructor(key, name) {
    super(key, name, /* varname = */ null, /* setupvarname = */ 'equipment')
  }

  doAddObject(market_object) {
    var equipment = market_object.getObject()
    State.variables.armory.addEquipment(equipment)
  }
}
