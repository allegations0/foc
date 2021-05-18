setup.qcImpl.Equipment = class Equipment extends setup.Cost {
  constructor(equipment_pool) {
    super()

    if (!equipment_pool) throw new Error(`Null equipment pool`)
    this.pool_key = setup.keyOrSelf(equipment_pool)
  }

  text() {
    return `setup.qc.Equipment(setup.equipmentpool.${this.pool_key})`
  }

  apply(quest) {
    var pool = setup.equipmentpool[this.pool_key]
    var equip = pool.generateEquipment()
    State.variables.armory.addEquipment(equip)
  }

  explain() {
    var pool = setup.equipmentpool[this.pool_key]
    return `Gain an equipment from ${pool.rep()}`
  }
}
