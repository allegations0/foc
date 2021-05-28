setup.qcImpl.SlaveOrderDrow = class SlaveOrderDrow extends setup.qcImpl.SlaveOrderTemplate {
  /**
   * @param {number} base_price 
   */
  constructor(base_price) {
    super()

    this.base_price = base_price
    this.trait_multi = 500
    this.value_multi = 0

    this.name = 'Order for a slave from the drow'
    this.company_key = 'drow'
    this.destination_unit_group_key = 'soldslaves'
  }

  getCriteria(quest) {
    const disaster = []
    const critical = [setup.rng.choice(
      setup.TraitHelper.getAllTraitsOfTags(['per'])
    )]

    const req = [
      setup.qres.Job(setup.job.slave),
      setup.qres.NoTrait(setup.trait.training_mindbreak),
    ]

    const criteria = new setup.UnitCriteria(
      null, /* key */
      'Slave Order from the Drow', /* title */
      critical,
      disaster,
      req,
      {}  /* skill effects */
    )
    return criteria
  }

  text() {
    return `setup.qc.SlaveOrderDrow(${this.base_price})`
  }
}
