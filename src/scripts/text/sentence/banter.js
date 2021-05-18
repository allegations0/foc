import { BANTER_TOPIC } from "../raw/banter/topic"
import { BANTER_TRAINING_MINDBREAK, BANTER_TRAINING_NONE, BANTER_TRAINING_OBJECT, BANTER_TRAINING_VERB, BANTER_VERB_SLAVER_FRIEND, BANTER_VERB_SLAVER_LOVER, BANTER_VERB_SLAVER_RIVAL, BANTER_VERB_SLAVE_ABUSE, BANTER_VERB_SLAVE_CARE } from "../raw/banter/verb"

// get random from a text specs: [{initiator: [], target: [], verbs: []}]
setup.Text.Banter._getRandom = function(specs, initiator, target) {
  var eligibles = []
  for (var i = 0; i < specs.length; ++i) {
    var spec = specs[i]
    var ok = true
    if (spec.initiator) {
      for (var j = 0; j < spec.initiator.length; ++j) {
        var trait = setup.trait[spec.initiator[j]]
        if (!initiator.isHasTrait(trait)) {
          ok = false
          break
        }
      }
    }
    if (!ok) continue
    if (spec.target) {
      for (var j = 0; j < spec.target.length; ++j) {
        var trait = setup.trait[spec.target[j]]
        if (!target.isHasTrait(trait)) {
          ok = false
          break
        }
      }
    }
    if (!ok) continue
    eligibles.push([spec.verbs, spec.verbs.length])
  }
  if (!eligibles.length) throw new Error(`??? eligibles missing???`)
  setup.rng.normalizeChanceArray(eligibles)
  var chosen = setup.rng.sampleArray(eligibles)
  return setup.rng.choice(chosen)
}

setup.Text.Banter._getTopic = function() {
  return setup.rng.choice(BANTER_TOPIC)
}

setup.Text.Banter._getAdverb = function(unit, is_care, is_abuse) {
  var candidates = []
  var speech = unit.getSpeech()
  var adverbs = speech.getAdverbs()
  if (is_care) {
    if (speech == setup.speech.friendly || speech == setup.speech.cool || speech == setup.speech.witty) {
      candidates = candidates.concat(adverbs)
    }
  } else if (is_abuse) {
    if (speech != setup.speech.friendly) {
      candidates = candidates.concat(adverbs)
    }
  } else {
    candidates = candidates.concat(adverbs)
  }
  var candidates = [].concat(unit.getSpeech().getAdverbs())
  var traits = unit.getAllTraitsWithTag('per')
  for (var i = 0; i < traits.length; ++i) {
    var text = traits[i].text()
    if (is_care && !text.care) continue
    if (is_abuse && !text.abuse) continue
    if ('adverbs' in text) {
      var adverbs = text.adverbs
      candidates = candidates.concat(adverbs)
    }
  }

  if (!candidates.length) return ''
  return setup.rng.choice(candidates)
}

setup.Text.Banter._generateSlaver = function(initiator, target, amt) {
  var verb_candidate = null
  var connector = null
  if (amt < 0) {
    verb_candidate = BANTER_VERB_SLAVER_RIVAL
    connector = ''
  } else if (initiator.getLover() == target) {
    verb_candidate = BANTER_VERB_SLAVER_LOVER
    connector = setup.rng.choice([
      `as a reward for`,
      `for`,
      `rewarding`,
      `after appreciating`,
      `after a show of`,

      `appreciating`,
      `as an appreciation for`,
      `to show appreciation for`,
      `while fantasizing about`,
      `all while thinking about`,
    ])
  } else {
    verb_candidate = BANTER_VERB_SLAVER_FRIEND
    connector = setup.rng.choice(['about', 'on the topic of', 'regarding', 'concerning', 'on the subject of'])
  }
  var verb = setup.Text.Banter._getRandom(verb_candidate, initiator, target)

  var adverb = setup.Text.Banter._getAdverb(initiator)

  let topic
  if (amt >= 0 && initiator.getLover() == target) {
    topic = setup.Text.Praise.noun(target)
    topic = `b|their ${topic}`
  } else {
    topic = setup.Text.Banter._getTopic()
  }

  return `a|Rep ${adverb} ${verb} ${connector} ${topic}.`
}

setup.Text.Banter._generateSlave = function(initiator, target, amt) {
  var verb_candidate = null
  var adverb = null
  if (amt > 0) {
    verb_candidate = BANTER_VERB_SLAVE_CARE
    adverb = setup.Text.Banter._getAdverb(initiator, /* is care = */ true)
  } else {
    verb_candidate = BANTER_VERB_SLAVE_ABUSE
    adverb = setup.Text.Banter._getAdverb(initiator, /* is care = */ false, /* is abuse = */ true)
  }
  var verb = setup.Text.Banter._getRandom(verb_candidate, initiator, target)
  var extra = setup.Text.Banter.slaveTrainingText(target)
  return `a|Rep ${adverb} ${verb}. ${extra}.`
}

setup.Text.Banter.generate = function(initiator, target, amt) {
  // generate a text banter from initiator to target with the given amt.

  if (!initiator.isSlaver()) throw new Error(`Banter initiator must be a slaver`)

  let raw_text
  if (target.isSlave()) {
    raw_text = setup.Text.Banter._generateSlave(initiator, target, amt)
  } else {
    raw_text = setup.Text.Banter._generateSlaver(initiator, target, amt)
  }

  return setup.Text.replaceUnitMacros(raw_text, {a: initiator, b: target})
}

setup.Text.Banter.slaveTrainingText = function(unit) {
  // generates a random sentence from the unit's main training
  var base = ''
  if (unit.isMindbroken()) {
    base = setup.rng.choice(BANTER_TRAINING_MINDBREAK)
  } else {
    var training = setup.UnitTitle.getMainTraining(unit)
    if (training == setup.trait.training_none) {
      base = setup.rng.choice(BANTER_TRAINING_NONE)
    } else {
      var smallest = training.getTraitGroup().getSmallestTrait()
      var index = training.getTraitGroup()._getTraitIndex(training)
      var objectchoice = BANTER_TRAINING_OBJECT[smallest.key]
      var verbchoice = BANTER_TRAINING_VERB[index]
      var verb = setup.rng.choice(verbchoice)
      var obj = setup.rng.choice(objectchoice)
      base = `${verb} ${obj}`
    }
  }
  return setup.Text.replaceUnitMacros(
    `a|Rep ${base}`, {a: unit}
  )
}
