
setup.UnitPoolHelper = {}

setup.UnitPoolHelper.physHelper = function(
    base_obj,
    tags,
    chance_sum,
) {
  /* tags: [dick, balls, vagina, anus, breast, height, muscle]
  /* chance_sum: {
    common: 1.0
    rare: 0.1
    etc
    skip if not needed
  }
  */
  
  const allphys = ['dick', 'breast', 'vagina', 'anus', 'balls', 'height', 'face', 'muscle', 'tough',]
  for (var j = 0; j < allphys.length; ++j) {
    var physt = allphys[j]
    if (physt in base_obj) delete base_obj[physt]
  }

  const min1 = ['dick', 'breast', 'vagina', 'anus', 'balls']
  for (var j = 0; j < tags.length; ++j) {
    var example_trait = null
    for (var traitkey in setup.trait) if (setup.trait[traitkey].isHasTag(tags[j])) {
      example_trait = setup.trait[traitkey]
    }
    if (!example_trait) throw new Error(`Cant find trait with tag ${tags[j]}`)

    var traits = example_trait.getTraitGroup().getTraits()
    var chances = {}
    for (var key in chance_sum) {
      var numtraits = 0
      for (var i = 0; i < traits.length; ++i) if (traits[i] && traits[i].isHasTag(key)) ++numtraits
      for (var i = 0; i < traits.length; ++i) if (traits[i] && traits[i].isHasTag(key)) {
        chances[traits[i].key] = 1.0 * chance_sum[key] / numtraits
      }
    }

    var min = 0
    var max = 1
    if (min1.includes(tags[j])) min = 1
    base_obj[tags[j]] = {
      chances: chances,
      min: min,
      max: max,
    }
  }

}

setup.UnitPoolHelper.physHelperMale = function(base_obj,) {
  return setup.UnitPoolHelper.physHelper(base_obj,
    ['muscle', 'dick', 'balls', 'anus', 'height', 'face', 'tough'],
    {
      common: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_COMMON,
      medium: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_MEDIUM,
      rare: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_RARE,
      unicorn: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_UNICORN,
    })
}

setup.UnitPoolHelper.physHelperFemale = function(base_obj,) {
  return setup.UnitPoolHelper.physHelper(base_obj,
    ['muscle', 'breast', 'vagina', 'anus', 'height', 'face', 'tough'],
    {
      common: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_COMMON,
      medium: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_MEDIUM,
      rare: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_RARE,
      unicorn: setup.UNIT_POOL_PHYS_TRAITS_AVERAGE_UNICORN,
    })
}

setup.UnitPoolHelper.getOneTraitObj = function(trait) {
  return setup.UnitPoolHelper.getTraitChanceObj(
    [[[trait], 1.0]],
    1,
    1
  )
}

/**
 * @param {Array} trait_sum_chance_list 
 * @param {number} min_traits 
 * @param {number} max_traits 
 */
setup.UnitPoolHelper.getTraitChanceObj = function(
  trait_sum_chance_list,
  min_traits,
  max_traits,
) {
  /* trait_sum_chance_list:
  [
    [
      [trait1, trait2, trait3],
      0.3
    ],
    [
      [trait4, trait5],
      0.2
    ],
  ]
  */
  var chances = {}
  for (var i = 0; i < trait_sum_chance_list.length; ++i) {
    var traits = trait_sum_chance_list[i][0]
    var sumchance = trait_sum_chance_list[i][1]
    for (var j = 0; j < traits.length; ++j) {
      chances[traits[j].key] = 1.0 * sumchance / traits.length
    }
  }
  return {
    chances: chances,
    min: min_traits,
    max: max_traits
  }
}


setup.UnitPoolHelper.setChance = function(obj, traits, combined_chance) {
  // sets for each trait, obj[trait.key] = combined_chance / len(traits)
  for (var i = 0; i < traits.length; ++i) {
    obj[traits[i].key] = 1.0 * combined_chance / traits.length
  }
}

