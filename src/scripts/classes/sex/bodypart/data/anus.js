setup.SexBodypartClass.Anus = class Anus extends setup.SexBodypart {
  constructor() {
    super(
      'anus',
      [  /* tags */
      ],
      'Anus',
      'Anus',
    )
  }

  /**
   * @returns {setup.Restriction[]}
   */
  getHasRestrictions() {
    return [
      setup.qres.AnyTrait([setup.trait.anus_tight, setup.trait.anus_loose, setup.trait.anus_gape], true),
    ]
  }

  repSimple(unit) {
    return setup.rng.choice(['anus', 'asshole',])
  }

  getTraitSizeMap() {
    return {
      anus_tight: 2,
      anus_loose: 4,
      anus_gape: 6,
    }
  }

  getTraitSizeModifierMap() {
    return {
      training_anal_basic: setup.Sex.BODYPART_SIZE_TRAINING_BASIC,
      training_anal_advanced: setup.Sex.BODYPART_SIZE_TRAINING_ADVANCED,
      training_anal_master: setup.Sex.BODYPART_SIZE_TRAINING_MASTER,
      default: 0,
    }
  }

  /**
   * @param {number} size 
   * @returns {string}
   */
  static holeSizeAdjective(size) {
    if (size >= 6) {
      return setup.trait.anus_gape.repSizeAdjective()
    } else if (size >= 4) {
      return setup.trait.anus_loose.repSizeAdjective()
    } else {
      return setup.trait.anus_tight.repSizeAdjective()
    }
  }

  repSizeAdjective(unit, sex) {
    return setup.SexBodypartClass.Anus.holeSizeAdjective(this.getSize(unit, sex))
  }

  getEquipmentSlots() {
    return [
      setup.equipmentslot.legs,
      setup.equipmentslot.rear,
    ]
  }

  giveArousalMultiplier(me, sex) {
    return setup.SexUtil.calculateTraitMultiplier(me, {
      training_anal_basic: setup.Sex.TRAIT_MULTI_LOW,
      training_anal_advanced: setup.Sex.TRAIT_MULTI_MEDIUM,
      training_anal_master: setup.Sex.TRAIT_MULTI_HIGH,

      training_mindbreak: -setup.Sex.TRAIT_MULTI_LOW,
    })
  }

  receiveArousalMultiplier(me, sex) {
    // A bit special, because it depends on whether the unit likes anal or not.
    const base = setup.SexUtil.calculateTraitMultiplier(me, {
      anus_tight: setup.Sex.TRAIT_MULTI_MEDIUM,
      anus_loose: 0,
      anus_gape: -setup.Sex.TRAIT_MULTI_LOW,

      training_mindbreak: -setup.Sex.TRAIT_MULTI_LOW,
    })
    return base * setup.SexBodypartClass.Anus.unitAnalEnjoymentMultiplier(me)
  }

  /**
   * Whether this bodypart is flexible towards facing
   * @returns {boolean}
   */
  isFlexible() { return true }

  /**
   * Get multiplier for how much this unit enjoys anal sex.
   * @param {setup.Unit} unit 
   * @returns {number}
   */
  static unitAnalEnjoymentMultiplier(unit) {
    // player always like anal sex
    if (unit.isYou()) return 1.0

    const score = {
      training_anal_basic: +1,
      training_anal_advanced: +2,
      training_anal_master: +10,

      per_chaste: -2,
      per_lustful: +1,
      per_sexaddict: +2,

      tough_tough: +1,
      tough_nimble: -0.5,

      muscle_thin: -0.5,
      muscle_verythin: -1.0,
      muscle_extremelythin: -2,
      muscle_strong: +0.5,
      muscle_verystrong: +1,
      muscle_extremelystrong: +2,

      per_brave: +1,
      per_cautious: -1,

      per_proud: +1,
      per_humble: -1,

      per_submissive: +2,
      per_dominant: -2,

      per_curious: +1,
      per_stubborn: -1,

      per_active: +1,
      per_studious: -1,
    }
    const raw = 0.5 * setup.SexUtil.sumTraitMultipliers(unit, score)
    return Math.max(-2.0, Math.min(2.0, raw))
  }

  repLabia(unit, sex) {
    return 'asshole'
  }

  repVaginal(unit, sex) {
    return 'anal'
  }

  repCunnilingus(unit, sex) {
    // only relevant for anus / vagina.
    return 'anilingus'
  }
}

setup.sexbodypart.anus = new setup.SexBodypartClass.Anus()
