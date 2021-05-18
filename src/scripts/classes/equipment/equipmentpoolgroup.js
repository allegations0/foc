
setup.EquipmentPoolGroup = class EquipmentPoolGroup extends setup.EquipmentPool {
  constructor(key, group_chances) {
    super(key, undefined)

    // note: this is behaved as an equipment pool
    // group_chances: {equipment_pool_key: chance}

    for (var groupkey in group_chances.length) {
      if (!(groupkey in setup.equipmentpool)) throw new Error(`group ${groupkey} not recognized in ${key}`)
    }
    this.group_chances = group_chances
  }

  generateEquipment() {
    var key = setup.rng.sampleObject(this.group_chances, true)
    var pool = setup.equipmentpool[key]
    return pool.generateEquipment()
  }
}


