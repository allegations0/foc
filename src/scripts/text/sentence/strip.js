setup.Text.Strip = {}

// "take off his pants and"
// "" (if no pants)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffpantsand = function (unit) {
  const cover = unit.getGenitalCovering()
  if (!cover) return ''

  const rep = cover.rep()
  return setup.Text.replaceUnitMacros([
    `a|take off a|their ${rep} and`,
    `a|strip out of a|their ${rep} and`,
    `a|get out of a|their ${rep} and`,
  ], { a: unit })
}

// "take off his shirt and"
// "" (if no shirt)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffshirtand = function (unit) {
  const cover = unit.getChestCovering()
  if (!cover) return ''

  const rep = cover.rep()
  return setup.Text.replaceUnitMacros([
    `a|take off a|their ${rep} and`,
    `a|strip out of a|their ${rep} and`,
    `a|get out of a|their ${rep} and`,
  ], { a: unit })
}


// "take off his clothes and"
// "" (if no clothes)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffequipmentand = function (unit) {
  if (unit.isNaked()) {
    return ''
  }

  const rep = setup.Text.Unit.Equipment.equipmentSummary(unit)

  return setup.Text.replaceUnitMacros([
    `a|take off a|their ${rep} and`,
    `a|strip out of a|their ${rep} and`,
    `a|get out of a|their ${rep} and`,
  ], { a: unit })
}


// "unfasten his ballgag and"
// "" (if no gag)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffmouthand = function (unit) {
  const mouth = unit.getEquipmentAt(setup.equipmentslot.mouth)
  if (!mouth) return ''

  const rep = mouth.rep()
  const tags = mouth.getTags()

  let t = []
  if (tags.includes('mouthcover')) {
    t = [
      `a|pull down a|their ${rep} and`,
      `a|take off a|their ${rep} and`,
    ]
  } else if (tags.includes('plaguemask')) {
    t = [
      `a|unmask and`,
      `a|take off a|their ${rep} and`,
    ]
  } else if (tags.includes('dildogag')) {
    t = [
      `a|remove the ${rep} from a|their throat and`,
      `a|unplug the ${rep} from a|their throat and`,
    ]
  } else if (tags.includes('gag')) {
    t = [
      `a|unfasten the ${rep} and`,
      `a|remove the ${rep} from a|their a|mouth and`,
    ]
  } else {
    t = [
      `a|remove the ${rep} and`,
      `a|take off the ${rep} and`,
    ]
  }

  return setup.Text.replaceUnitMacros(t, { a: unit })
}


// "remove his blindfold and"
// "" (if no eye covering)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffeyesand = function (unit) {
  const eq = unit.getEquipmentAt(setup.equipmentslot.eyes)
  if (!eq || !eq.isMakeBodypartUseless()) return ''

  const rep = eq.rep()
  const tags = eq.getTags()

  return setup.Text.replaceUnitMacros([
    `a|take off a|their ${rep} and`,
    `a|remove a|their ${rep} and`,
  ], { a: unit })
}


// "take out his buttplug and"
// "" (if no gag)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffanusand = function (unit) {
  const eq = unit.getEquipmentAt(setup.equipmentslot.rear)
  if (!eq) return ''

  const rep = eq.rep()
  const tags = eq.getTags()

  let t
  if (tags.includes('buttplug')) {
    t = [
      `a|remove the ${rep} lodged deep within a|their a|anus and`,
      `a|take out the ${rep} from within a|their a|anus and`,
      `a|pull out the ${rep} from a|their a|anus and`,
    ]
  } else {
    t = [
      `a|take off a|their ${rep} and`,
      `a|remove a|their ${rep} and`,
    ]
  }

  return setup.Text.replaceUnitMacros(t, { a: unit })
}


// "take out her dildo and"
// "remove their chastity and"
// "" (if no genital covering)
/**
 * @param {setup.Unit} unit 
 * @returns {string}
 */
setup.Text.Strip.takeoffgenitaland = function (unit) {
  const eq = unit.getEquipmentAt(setup.equipmentslot.genital)
  if (!eq) return ''

  const rep = eq.rep()
  const tags = eq.getTags()

  let t
  if (tags.includes('chastity')) {
    t = [
      `a|remove a|their ${rep} and`,
      `a|unlock a|their ${rep} and`,
    ]
  } else if (tags.includes('dickplug')) {
    t = [
      `a|remove the ${rep} painfully inserted into a|their urethra and`,
      `slowly a|pull out the ${rep} from a|their urethra and`,
    ]
  } else if (tags.includes('vegetable')) {
    t = [
      `a|remove the fresh and juicy ${rep} lodged inside a|them and`,
      `a|pull out the cold and wet ${rep} from a|their a|vagina and`,
    ]
  } else if (tags.includes('dildo')) {
    t = [
      `a|remove the ${rep} lodged deep inside a|them and`,
      `a|pull out the ${rep} from a|their a|vagina and`,
    ]
  } else {
    t = [
      `a|take off a|their ${rep} and`,
      `a|remove a|their ${rep} and`,
    ]
  }

  return setup.Text.replaceUnitMacros(t, { a: unit })
}
