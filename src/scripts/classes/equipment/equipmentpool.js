
setup.EquipmentPool = class EquipmentPool extends setup.TwineClass {
  constructor(key, equip_chances) {
    super()
    // equip_chances: {equipment_key: chance}
    this.key = key
    this.equip_chances = equip_chances

    if (key in setup.equipmentpool) throw new Error(`Duplicate equipment pool key ${key}`)
    setup.equipmentpool[key] = this
  }

  getName() {
    return this.key
  }

  rep() {
    return setup.repMessage(this, 'equipmentpoolcardkey')
  }

  generateEquipment() {
    var equip_key = setup.rng.sampleObject(this.equip_chances, true)
    return setup.equipment[equip_key]
  }

}
