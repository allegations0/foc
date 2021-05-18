import { generateUnitName } from "../../../names/namegen"

setup.UnitPool = class UnitPool extends setup.TwineClass {
  /**
   * @param {string} key 
   * @param {string} name 
   * @param {Object} trait_alloc 
   * @param {Object | Array} base_stat_ranges 
   * @param {setup.Cost[]} [post_process]
   */
  constructor(key, name, trait_alloc, base_stat_ranges, post_process) {
    super()
    // base stat ranges: either [[1, 2], [2, 4], ..., ]
    // or {combat: [1, 2], brawn: [3, 4], ...}

    this.key = key
    this.name = name
    this.trait_alloc = trait_alloc

    this.base_stat_ranges = setup.Skill.translate(base_stat_ranges)

    this.post_process = post_process || []

    // verify trait alloc
    for (var traitallockey in trait_alloc) {
      var tob = trait_alloc[traitallockey]
      if (!('chances' in tob)) throw new Error(`UnitPool ${key}'s ${traitallockey} missing chances`)
      if (!('min' in tob)) throw new Error(`UnitPool ${key}'s ${traitallockey} missing min`)
      if (!('max' in tob)) throw new Error(`UnitPool ${key}'s ${traitallockey} missing max`)
      var ch = tob.chances
      for (var traitkey in ch) {
        if (!(traitkey in setup.trait)) throw new Error(`Unknown trait ${traitkey} in unitpool ${key}'s ${traitallockey}`)
        if (ch[traitkey] === NaN) throw new Error(`NaN for ${traitkey} in unitpool ${key}'s ${traitallockey}`)
        if (!setup.trait[traitkey].getTags().includes(traitallockey)) {
          throw new Error(`Trait ${traitkey} in ${key} does not include ${traitallockey}`)
        }
      }
    }

    if (key in setup.unitpool) throw new Error(`Unitpool ${this.key} duplicated`)
    setup.unitpool[key] = this
  }

  getName() { return this.name }

  rep() {
    return setup.repMessage(this, 'unitpoolcardkey')
  }

  static getChanceArray(chance_obj, is_must_succeed, forbiddens) {
    let base_array = []
    let sum_chance = 0.0
    for (let key in chance_obj) {
      if (forbiddens && forbiddens.includes(key)) continue
      let chance = chance_obj[key]
      if (chance > 0) {
        base_array.push([key, chance])
        sum_chance += chance
      }
    }
    if (sum_chance <= 0 && is_must_succeed) throw new Error(`Failed chance array`)
    if (sum_chance > 1 || is_must_succeed) {
      setup.rng.normalizeChanceArray(base_array)
    }
    return base_array
  }

  _generateSkills() {
    var skills = []
    for (var i = 0; i < setup.skill.length; ++i) {
      var lower = this.base_stat_ranges[i][0]
      var upper = this.base_stat_ranges[i][1]
      skills.push(lower + Math.floor(Math.random() * (upper - lower + 1)))
    }
    return skills
  }

  /**
   * @returns {{mean: number, min: number, max: number}}
   */
  computeStatistics() {
    let sumval = 0
    let min = setup.INFINITY
    let max = 0
    for (let i = 0; i < setup.COMPUTE_APPROXIMATE_VALUE_REPS; ++i) {
      const unit = this.generateUnit()
      sumval += unit.getSlaveValue()
      min = Math.min(min, unit.getSlaveValue())
      max = Math.max(max, unit.getSlaveValue())
      unit.delete()
    }
    State.variables.notification.popAll()
    const mean = Math.round(sumval / setup.COMPUTE_APPROXIMATE_VALUE_REPS * setup.COMPUTE_APPROXIMATE_VALUE_MULTIPLIER)
    return {
      min: min,
      max: max,
      mean: mean,
    }
  }

  // classmethod
  static generateTraitsFromObj(chances, traitmin, traitmax) {
    // chances = {bg_race: 0.5}
    // return the KEYS of the traits as a list
    var obtained_trait_keys = []
    if (traitmax < traitmin) throw new Error(`Weird, max is smaller than min`)

    var tentative = []
    for (var chance_key in chances) {
      var chance = chances[chance_key]
      if (Math.random() < chance) {
        tentative.push(chance_key)
      }
    }
    setup.rng.shuffleArray(tentative)

    // try to push from tentative one by one
    for (var i = 0; i < tentative.length; ++i) {
      if (obtained_trait_keys.length >= traitmax) continue
      var trait = setup.trait[tentative[i]]
      if (obtained_trait_keys.includes(tentative[i])) continue
      var traitgroup = trait.getTraitGroup()
      if (traitgroup) {
        var conflict = false
        for (var j = 0; j < obtained_trait_keys.length; ++j) {
          var cmptrait = setup.trait[obtained_trait_keys[j]]
          if (cmptrait.getTraitGroup() == traitgroup) {
            conflict = true
            break
          }
        }
        if (conflict) continue
      }
      obtained_trait_keys.push(trait.key)
    }

    while (obtained_trait_keys.length < traitmin) {
      var must_succeed = true

      // generate the "still possible" tags
      var banlist = {}
      for (var i = 0; i < obtained_trait_keys.length; ++i) {
        var trait = setup.trait[obtained_trait_keys[i]]
        var traitgroup = trait.getTraitGroup()
        if (traitgroup) {
          var bantraits = traitgroup.getTraits()
          for (var j = 0; j < bantraits.length; ++j) {
            if (bantraits[j]) {
              banlist[bantraits[j].key] = true
            }
          }
        }
      }

      var still_possible = {}
      for (var chance_key in chances) {
        if (chance_key in banlist) continue
        still_possible[chance_key] = chances[chance_key]
      }

      var chance_array = setup.UnitPool.getChanceArray(still_possible, must_succeed, obtained_trait_keys)

      var sample = setup.rng.sampleArray(chance_array)
      if (sample) {
        obtained_trait_keys.push(sample)
      } else {
        if (must_succeed) throw new Error(`Something weird happens.`)
        break
      }
    }
    return obtained_trait_keys
  }

  _generateTraits() {
    var trait_alloc = this.trait_alloc
    var trait_keys = []

    for (var traitgroup in trait_alloc) {
      var base_obj = trait_alloc[traitgroup]
      var chances = base_obj.chances
      var traitmin = base_obj.min
      var traitmax = base_obj.max
      var obtained_trait_keys = setup.UnitPool.generateTraitsFromObj(chances, traitmin, traitmax)
      Array.prototype.push.apply(trait_keys, obtained_trait_keys)
    }

    var traits = []
    for (var i = 0; i < trait_keys.length; ++i) {
      var key = trait_keys[i]
      if (!(key in setup.trait)) `Trait ${key} not found`
      traits.push(setup.trait[key])
    }
    return traits
  }

  generateUnit() {
    // preference is from settings.GENDER_PREFERENCE
    var traits = this._generateTraits()
    var skills = this._generateSkills()
    var namearray = generateUnitName(traits)
    var unit = new setup.Unit(namearray, traits, skills)

    // post-process it
    setup.RestrictionLib.applyAll(this.post_process, setup.costUnitHelper(unit))

    return unit
  }

  /**
   * Returns unit pool for this race/gender combination.
   * @param {setup.Trait=} subrace 
   * @param {setup.Trait=} gender 
   */
  static getUnitPool(subrace, gender) {
    let unitpools = Object.values(setup.unitpool)

    if (subrace) {
      unitpools = unitpools.filter(unitpool => unitpool.key.startsWith(subrace.key))
    }
    if (gender == setup.trait.gender_male) {
      unitpools = unitpools.filter(unitpool => unitpool.key.endsWith('male'))
    } else if (gender == setup.trait.gender_female) {
      unitpools = unitpools.filter(unitpool => unitpool.key.endsWith('female'))
    }

    return setup.rng.choice(unitpools)
  }
}
