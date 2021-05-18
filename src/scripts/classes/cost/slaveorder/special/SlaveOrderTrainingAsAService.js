
setup.qcImpl.SlaveOrderTrainingAsAService = class SlaveOrderTrainingAsAService extends setup.qcImpl.SlaveOrderTemplate {
  constructor() {
    super()

    this.base_price = setup.MONEY_PER_SLAVER_WEEK * 1.5

    this.trait_multi = setup.MONEY_PER_SLAVER_WEEK * 3

    this.value_multi = 1.0

    this.name = 'Order from a client in the City of Lucgate.'
    this.company_key = 'humankingdom'

    this.expires_in = 8

    this.fulfilled_outcomes = []

    this.unfulfilled_outcomes = [
      setup.qc.Ire('humankingdom', 5),
      setup.qc.RemoveTitleGlobal('training_as_a_service'),
    ]

    this.destination_unit_group_key = setup.unitgroup.soldslaves.key
  }

  text() {
    return `setup.qc.SlaveOrderTrainingAsAService()`
  }


  getCriteria(quest) {
    var disaster = []

    // retrieve a random training
    var trainings = setup.TraitHelper.getAllTraitsOfTags([
      'trbasic', 'trmale', 'trfemale', 'trnonbasic',
    ])
    var training = setup.rng.choice(trainings)
    var cover = training.getTraitGroup().getTraitCover(training)

    var critical = cover

    var req = [
      setup.qres.Job(setup.job.slave),
      setup.qres.Trait(setup.trait.training_obedience_basic,),
      setup.qres.HasTitle('training_as_a_service'),
    ]

    var criteria = new setup.UnitCriteria(
      null, /* key */
      'Order from a client in the City of Lucgate', /* title */
      critical,
      disaster,
      req,
      {}  /* skill effects */
    )
    return criteria
  }
}
