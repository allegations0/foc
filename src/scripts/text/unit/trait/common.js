
// Describes the ENTIRE unit's traits with a certain tag.
setup.Text.Unit.Trait.describeAll = function(unit, tag) {
  // first gather the texts.
  var texts = []
  var pertraits = unit.getAllTraitsWithTag(tag)
  for (var i = 0; i < pertraits.length; ++i) {
    var trait = pertraits[i]
    texts.push(setup.Text.Unit.Trait.description(unit, trait))
  }
  if (!texts.length) {
    return ''
  }

  var connectors = [
    `a|Rep `,
    `a|They also `,
    `In addition, a|they `,
  ]

  var text = ''
  for (var i = 0; i < texts.length; ++i) {
    if (i % 3 == 0) {
      if (i) text += '. '
      text += connectors[(Math.floor(i / 3) % 3)]
    } else {
      // find the connector
      if (i % 3 == 1 && i + 1 < texts.length) {
        text += ', '
      } else {
        text += ', and '
      }
    }
    text += texts[i]
  }
  text += '.'

  return setup.Text.replaceUnitMacros(text, {a: unit})
}
