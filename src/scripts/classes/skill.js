
setup.SkillHelper = {}

setup.Skill = class Skill extends setup.TwineClass {
  /**
   * @param {string} keyword
   * @param {string} name
   * @param {string} description
   */
  constructor(keyword, name, description) {
    super()

    this.key = setup.skill.length
    this.keyword = keyword
    this.name = name
    this.description = description

    if (keyword in setup.skill) throw new Error(`Duplicate role ${keyword}`)
    setup.skill[keyword] = this
    setup.skill.push(this)
  }

  getName() { return this.name }

  getDescription() { return this.description }

  getImage() {
    // Apparently ad-block does not like social.png, so this had to be renamed.
    if (this.keyword == 'social') {
      return `img/role/sc.svg`
    } else {
      return `img/role/${this.keyword}.svg`
    }
  }

  getImageRep() {
    return setup.repImgIcon(this.getImage())
  }

  rep() {
    return setup.repImgIcon(this.getImage(), `<<tooltipskill '${this.key}'>>`)
  }

  repPositive() {
    return `<span class='skillcardglow'>${this.rep()}</span>`
  }

  /**
   * @param {array | object} array_or_obj
   * @returns {number[]}
   */
  static translate(array_or_obj) {
    // translates array or object skill into array
    // e.g., [1, 2, 3, 4, 5, ...] or {'brawn': 1}
    if (Array.isArray(array_or_obj)) {
      if (array_or_obj.length != setup.skill.length) throw new Error(`${array_or_obj} length not correct`)
      return array_or_obj
    }
    var result = Array(setup.skill.length).fill(0)
    for (var key in array_or_obj) {
      if (!(key in setup.skill)) throw new Error(`Unrecognized skill: ${key}`)
      var skill = setup.skill[key]
      result[skill.key] = array_or_obj[key]
    }
    return result
  }
}


setup.SkillHelper.explainSkillMods = function (skill_mod_array_raw, is_hide_skills, is_no_mult) { // given [0, 1, 2, 4, ...] explain it.
  var skill_array = setup.Skill.translate(skill_mod_array_raw)
  var texts = []
  var mid = ' x '
  if (is_no_mult) mid = ' '
  for (var i = 0; i < skill_array.length; ++i) {
    if (skill_array[i]) {
      var image_rep = setup.skill[i].rep()
      if (is_hide_skills) {
        image_rep = setup.skill[i].getName()
      }
      var sign = ''
      if (skill_array[i] > 0) sign = '+'
      var percent = Math.round(skill_array[i] * 100)
      var fixed = 1
      if (percent % 10) fixed = 2
      var vtext = `${sign}${(percent / 100).toFixed(fixed)}`
      if (!is_hide_skills) {
        if (sign == '+') {
          vtext = setup.DOM.toString(setup.DOM.Text.successlite(vtext))
        } else if (vtext.startsWith('-')) {
          vtext = setup.DOM.toString(setup.DOM.Text.dangerlite(vtext))
        }
      }
      texts.push(
        `${vtext}${mid}${image_rep}`
      )
    }
  }
  return texts.join('║')
}

setup.SkillHelper.explainSkillModsShort = function (skill_mod_array_raw, is_hide_skills, unit) {
  // given [0, 1, 2, 4, ...] explain it.
  var skill_array = setup.Skill.translate(skill_mod_array_raw)
  var texts = []
  for (var i = 0; i < skill_array.length; ++i) {
    if (skill_array[i]) {
      var image_rep = setup.skill[i].rep()
      if (is_hide_skills) {
        image_rep = setup.skill[i].getName()
      }
      if (unit && unit.getSkillFocuses().includes(setup.skill[i])) {
        image_rep = `${setup.skill[i].repPositive()}`
      }
      texts.push(
        `${image_rep}`
      )
      for (var j = 2; j <= skill_array[i] + 0.0000001; ++j) {
        texts.push(
          `${image_rep}`
        )
      }
    }
  }
  return texts.join('')
}


/**
 * 
 * @typedef {{val: number, add: number, modifier: number, skill: setup.Skill, modifier_add: number, innate_add?: number}} ExplainSkillWithAdditiveArgs
 * 
 * @param {ExplainSkillWithAdditiveArgs} args
 */
setup.SkillHelper.explainSkillWithAdditive = function ({ val, add, modifier, modifier_add, skill, innate_add }) {
  var image_rep = skill.rep()
  if (!innate_add) innate_add = 0

  let val_text
  if (innate_add) {
    val_text = setup.DOM.toString(setup.DOM.Text.infolite(`${val}`))
  } else {
    val_text = `${val}`
  }

  var add_text = ''
  if (add > 0) {
    add_text += setup.DOM.toString(setup.DOM.Text.successlite(`+${add}`))
  } else if (add < 0) {
    add_text += setup.DOM.toString(setup.DOM.Text.dangerlite(`-${-add}`))
  }

  const modifier_texts = []
  if (innate_add) {
    modifier_texts.push(`+${innate_add} (boosts)`)
  }

  modifier = Math.round(modifier * 100)
  if (modifier > 0) {
    modifier_texts.push(`+${modifier}%`)
  } else if (modifier < 0) {
    modifier_texts.push(`-${-modifier}%`)
  }

  if (modifier_add) {
    if (modifier_add > 0) {
      modifier_texts.push(`+${modifier_add}`)
    } else {
      modifier_texts.push(`-${modifier_add}`)
    }
  }

  let modifier_text
  if (modifier_texts.length) {
    modifier_text = ` (${modifier_texts.join(',')} from modifiers)`
  } else {
    modifier_text = ''
  }

  if (!State.variables.settings.summarizeunitskills) {
    return `<span data-tooltip="${modifier_text}">${val_text}${add_text}</span> ${image_rep}`
  } else {
    var base = `${val + add}`

    val_text = `${val}`

    var addtext = `${val_text} + 0`
    if (add > 0) {
      addtext = `${val_text} + ${add}`
    } else if (add < 0) {
      addtext = `${val_text} - ${-add}`
    }
    if (innate_add > 0 && add >= 0) {
      base = setup.DOM.toString(setup.DOM.Text.infolite(base))
    } else if (add > 0) {
      base = setup.DOM.toString(setup.DOM.Text.successlite(base))
    } else if (add < 0) {
      base = setup.DOM.toString(setup.DOM.Text.dangerlite(base))
    } else {
    }
    return `<span data-tooltip="${addtext}${modifier_text}">${base}</span> ${image_rep}`
  }
}

/**
 * @param {setup.Unit} unit 
 */
setup.SkillHelper.explainSkillsWithAdditives = function (unit) {
  const skill_array_raw = unit.getSkillsBase(/* ignore skill boosts = */ true)
  const additives = unit.getSkillsAdd()
  const mods = unit.getSkillModifiers()
  const mod_additive = unit.getSkillAdditives()

  // given [0, 1, 2, 4, ...] explain it.
  // additives: can add +xx to the stat
  const skill_array = setup.Skill.translate(skill_array_raw)
  const additive_array = setup.Skill.translate(additives)
  const mod_array = setup.Skill.translate(mods)
  const mod_additive_array = setup.Skill.translate(mod_additive)
  const skill_boost = State.variables.skillboost.getBoosts(unit)

  var texts = []
  for (var i = 0; i < skill_array.length; ++i) {
    if (skill_array[i]) {
      const val = Math.round(skill_array[i])
      const add = Math.round(additive_array[i])
      const innate_add = skill_boost[i]
      texts.push(setup.SkillHelper.explainSkillWithAdditive({
        val: val,
        add: add,
        modifier: mod_array[i],
        modifier_add: mod_additive_array[i],
        skill: setup.skill[i],
        innate_add: innate_add,
      }))
    }
  }
  return texts.join('║')
}

setup.SkillHelper.explainSkills = function (skill_array_raw, is_hide_skills, is_to_fixed) {
  // given [0, 1, 2, 4, ...] explain it.
  const skill_array = setup.Skill.translate(skill_array_raw)
  const texts = []
  for (var i = 0; i < skill_array.length; ++i) {
    if (skill_array[i]) {
      let image_rep = setup.skill[i].rep()
      if (is_hide_skills) {
        image_rep = setup.skill[i].getName()
      }
      let val
      if (is_to_fixed) {
        val = skill_array[i].toFixed(1)
      } else {
        val = Math.round(skill_array[i])
      }
      texts.push(
        `${val} ${image_rep}`
      )
    }
  }
  return texts.join('║')
}


setup.SkillHelper.explainSkillsCopy = function (skill_array_raw) {
  // given [1, 0, 2, 1], output [brawn][surv][surv][intrigue]
  // must be integers
  var skill_array = setup.Skill.translate(skill_array_raw)
  var text = ''
  for (var i = 0; i < skill_array.length; ++i) {
    if (skill_array[i]) {
      var skill = setup.skill[i]
      for (var j = 0; j < skill_array[i]; ++j) {
        text += skill.rep()
      }
    }
  }
  return text
}



setup.Skill_Cmp = function (skill1, skill2) {
  if (skill1.key < skill2.key) return -1
  if (skill1.key > skill2.key) return 1
  return 0
}


// gives a score check between unit a and unit b in skill c.
// return 2 for crit win for a, 1 for win for a, -1, for lose for a, -2 for crit lose for a
// cannot draw
setup.Skill.skillCheckCompare = function (unit1, unit2, skill) {
  var skill1 = unit1.getSkill(skill)
  var skill2 = unit2.getSkill(skill)
  var rolls = 3
  var wins = 0
  for (var i = 0; i < rolls; ++i) {
    var score1 = skill1 / 2 + Math.random() * (skill1 / 2)
    var score2 = skill2 / 2 + Math.random() * (skill2 / 2)
    if (score1 > score2) wins += 1
  }
  if (wins == 3) return 2
  if (wins == 2) return 1
  if (wins == 1) return -1
  return -2
}
