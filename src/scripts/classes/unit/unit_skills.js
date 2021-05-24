setup.Unit.prototype.getSkillModifiers = function (is_base_only) {
  let traits
  if (is_base_only) {
    traits = this.getBaseTraits()
  } else {
    traits = this.getAllTraits()
  }

  var traitmodsum = Array(setup.skill.length).fill(0)
  const isdemon = this.isHasTrait(setup.trait.race_demon)
  const is_perk_reduce_trauma = this.isHasTrait(setup.trait.perk_reduce_trauma)
  const is_perk_reduce_corruption = this.isHasTrait(setup.trait.perk_reduce_corruption)
  const is_perk_increase_boon = this.isHasTrait(setup.trait.perk_increase_boon)

  for (var i = 0; i < traits.length; ++i) {
    // demons ignore demonic bodypart penalty
    if (isdemon && traits[i].isCorruption()) {
      continue
    }

    const traitmod = traits[i].getSkillBonuses()

    let modifier = 1.0

    // check for reduce trauma, corruption or increase boon effects
    if (is_perk_reduce_trauma && traits[i].getTags().includes('trauma')) {
      modifier *= (1.0 - setup.PERK_TRAUMA_PENALTY_REDUCTION)
    }

    if (is_perk_reduce_corruption && traits[i].isCorruption()) {
      modifier *= (1.0 - setup.PERK_CORRUPTION_PENALTY_REDUCTION)
    }

    if (is_perk_increase_boon && traits[i].getTags().includes('boon')) {
      modifier *= (1.0 + setup.PERK_BOON_BONUS_INCREASE)
    }

    for (var j = 0; j < traitmod.length; ++j) {
      traitmodsum[j] += traitmod[j] * modifier
    }
  }

  if (!is_base_only) {
    var equipmentset = this.getEquipmentSet()
    if (equipmentset) {
      var eqmod = equipmentset.getSkillMods()
      for (var j = 0; j < eqmod.length; ++j) traitmodsum[j] += eqmod[j]
    }
  }

  for (var i = 0; i < traits.length; ++i) {
    if (traitmodsum[i] < -0.9) {
      traitmodsum[i] = -0.9  // the cap
    }
  }

  return traitmodsum
}

setup.Unit.prototype.getSkillsBase = function (ignore_skill_boost) {
  const base = this.skills.filter(a => true)
  if (!ignore_skill_boost && State.variables.skillboost.isHasAnyBoost(this)) {
    const boosts = State.variables.skillboost.getBoosts(this)
    for (let i = 0; i < boosts.length; ++i) {
      base[i] += boosts[i]
    }
  }
  return base
}


setup.Unit.prototype.getSkillAdditives = function (is_base_only) {
  const nskills = setup.skill.length
  const result = new Array(nskills).fill(0)

  if (!is_base_only) {
    // vice leader effect
    if (this == State.variables.unit.player) {
      var viceleader = State.variables.dutylist.getDuty('viceleader')
      if (viceleader && viceleader.getAssignedUnit()) {
        const viceleader_unit = viceleader.getAssignedUnit()
        var vicestats = viceleader_unit.getSkills(/* is base only = */ true)
        for (var i = 0; i < vicestats.length; ++i) {
          result[i] += Math.floor(vicestats[i] * setup.VICELEADER_SKILL_MULTI)
        }
      }
    }

    // get friendship/rivalry bonuses
    var best_friend = State.variables.friendship.getBestFriend(this)
    if (best_friend) {
      var boost = false
      if (this.isSlaver() && best_friend.isSlaver()) {
        boost = true
      }
      if (boost) {
        // they are together, boost activate.
        var friendship = State.variables.friendship.getFriendship(this, best_friend)
        var friendskill = best_friend.getSkills(/* is base only = */ true)
        var myskill = this.getSkills(/* is base only = */ true)

        const is_lovers = State.variables.friendship.isLoversWithBestFriend(this)

        if (friendship > 0 || is_lovers) {
          // friendship
          var boost_amount = setup.FRIENDSHIP_MAX_SKILL_GAIN * Math.abs(friendship) / 1000
          // if (State.variables.friendship.isLoversWithBestFriend(this)) {
          //   boost_amount = setup.LOVERS_MAX_SKILL_GAIN
          // }
          for (var i = 0; i < friendskill.length; ++i) {
            if (friendskill[i] > myskill[i]) {
              result[i] += Math.floor(boost_amount * (friendskill[i] - myskill[i]))
            }
          }
        }

        if (friendship < 0 || is_lovers) {
          // rivalry
          var boost_amount = setup.RIVALRY_MAX_SKILL_GAIN * Math.abs(friendship) / 1000
          for (var i = 0; i < friendskill.length; ++i) {
            if (friendskill[i] < myskill[i]) {
              result[i] += Math.floor(boost_amount * friendskill[i])
            }
          }
        }
      }
    }

    // get bedchamber bonuses
    var rooms = State.variables.bedchamberlist.getBedchambers({ slaver: this })
    if (rooms.length) {
      var buffs = Array(setup.skill.length).fill(0)
      for (var i = 0; i < rooms.length; ++i) {
        var thisbuffs = rooms[i].getSkillAddition()
        for (var j = 0; j < setup.skill.length; ++j) {
          buffs[j] = Math.max(buffs[j], thisbuffs[j])
        }
      }
      for (var i = 0; i < setup.skill.length; ++i) {
        result[i] += buffs[i]
      }
    }

    // get title bonuses
    const title_bonus = State.variables.titlelist.computeSkillAdds(this)
    for (let j = 0; j < title_bonus.length; ++j) {
      result[j] += title_bonus[j]
    }

    // get room bonuses
    const room_bonuses = State.variables.roomlist.getTotalSkillBonuses()
    for (let i = 0; i < room_bonuses.length; ++i) {
      result[i] += room_bonuses[i]
    }
  }

  return result
}


setup.Unit.prototype.getSkillsAdd = function (is_base_only) {
  const nskills = setup.skill.length
  const multipliers = this.getSkillModifiers(is_base_only)
  const additives = this.getSkillAdditives(is_base_only)
  const result = this.getSkillsBase()

  for (var i = 0; i < nskills; ++i) {
    result[i] = Math.floor(result[i] * multipliers[i]) + additives[i]
  }

  return result
}


setup.Unit.prototype.getSkills = function (is_base_only) {
  var nskills = setup.skill.length
  var result = this.getSkillsBase()

  var adds = this.getSkillsAdd(is_base_only)
  for (var i = 0; i < nskills; ++i) {
    result[i] += adds[i]
  }

  return result
}

setup.Unit.prototype.getSkill = function (skill) {
  return this.getSkills()[skill.key]
}

setup.Unit.prototype.setSkillFocus = function (index, skill) {
  this.initSkillFocuses()

  if (index < 0 || index >= this.skill_focus_keys.length) throw new Error(`index out of range for set skill focus`)
  if (!skill) throw new Error(`skill not found for set skill focus`)
  this.skill_focus_keys[index] = skill.key
}


setup.Unit.prototype.getRandomSkillIncreases = function () {
  var skill_focuses = this.getSkillFocuses()
  var increases = Array(setup.skill.length).fill(0)
  var remain = setup.SKILL_INCREASE_PER_LEVEL

  for (var i = 0; i < skill_focuses.length; ++i) {
    var sf = skill_focuses[i]
    if (increases[sf.key]) continue
    increases[sf.key] = 1
    remain -= 1
  }

  for (var i = 0; i < skill_focuses.length; ++i) {
    var sf = skill_focuses[i]
    if (Math.random() < setup.SKILL_FOCUS_MULTI_INCREASE_CHANCE) {
      increases[sf.key] += 1
      remain -= 1
    }
  }

  var current_skills = this.getSkills(/* base only = */ true)
  while (remain) {
    /**
     * @type {Array<[number, number]>}
     */
    var eligible = []
    for (var i = 0; i < setup.skill.length; ++i) {
      if (increases[i] == 0) {
        eligible.push([i, Math.max(1, current_skills[i] - setup.SKILL_INCREASE_BASE_OFFSET)])
      }
    }
    setup.rng.normalizeChanceArray(eligible)
    var res = setup.rng.sampleArray(eligible)
    increases[res] += 1
    remain -= 1
  }
  return increases
}


setup.Unit.prototype.getSkillFocuses = function (is_not_sort) {
  this.initSkillFocuses()

  const skill_focuses = this.skill_focus_keys.map(skill_focus_key => setup.skill[skill_focus_key])
  if (!is_not_sort) skill_focuses.sort(setup.Skill_Cmp)
  return skill_focuses
}


setup.Unit.prototype._increaseSkill = function (skill, amt) {
  var verb = 'increased'
  if (amt < 0) verb = 'decreased'
  this.skills[skill.key] += amt
  this.resetCache()
}


setup.Unit.prototype.increaseSkills = function (skill_gains) {
  if (!Array.isArray(skill_gains)) throw new Error(`Skill gains must be array, not ${skill_gains}`)
  for (var i = 0; i < skill_gains.length; ++i) if (skill_gains[i]) {
    this._increaseSkill(setup.skill[i], skill_gains[i])
  }
}


setup.Unit.prototype.initSkillFocuses = function () {
  // compute initial skill focuses if it has not already been computed before.

  if (this.skill_focus_keys && this.skill_focus_keys.length) {
    return
  }

  var skills = this.getSkillModifiers()
  var skill_idx = []
  for (var i = 0; i < skills.length; ++i) {
    skill_idx.push([i, skills[i]])
  }
  setup.rng.shuffleArray(skill_idx)
  skill_idx.sort((a, b) => b[1] - a[1])

  var skill0 = setup.skill[skill_idx[0][0]]
  var skill1 = setup.skill[skill_idx[1][0]]
  var skill2 = setup.skill[skill_idx[2][0]]

  if (Math.random() < setup.SKILL_TRIPLE_FOCUS_CHANCE) {
    this.skill_focus_keys = [
      skill0.key,
      skill0.key,
      skill0.key,
    ]
  } else if (Math.random() < setup.SKILL_DOUBLE_FOCUS_CHANCE) {
    this.skill_focus_keys = [
      skill0.key,
      skill0.key,
      skill1.key,
    ]
  } else {
    this.skill_focus_keys = [
      skill0.key,
      skill1.key,
      skill2.key,
    ]
  }
  this.resetCache()
}
