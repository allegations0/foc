
setup.TitleHelper = {}

setup.TitleHelper.unitTitleDescribe = function (unit) {
  var titles = State.variables.titlelist.getAllTitles(unit)
  var texts = []
  for (var i = 0; i < titles.length; ++i) {
    var title = titles[i]
    var unittext = title.getUnitText(unit)
    if (unittext) texts.push(unittext)
  }
  if (!texts.length) return ''

  var prefixes = [
    `a|Rep `,
    `Also, a|they `,
    `In addition, a|they `,
  ]

  var res = ``
  for (var i = 0; i < texts.length; i += 3) {
    var subtexts = []
    subtexts.push(texts[i])
    if (i + 1 < texts.length) subtexts.push(texts[i + 1])
    if (i + 2 < texts.length) subtexts.push(texts[i + 2])
    var prefix = prefixes[(i / 3) % 3]
    res += prefix
    if (subtexts.length == 1) {
      res += `${subtexts[0]}. `
    }
    if (subtexts.length == 2) {
      res += `${subtexts[0]} and ${subtexts[1]}. `
    }
    if (subtexts.length == 3) {
      res += `${subtexts[0]}, ${subtexts[1]}, and ${subtexts[2]}. `
    }
  }
  return setup.Text.replaceUnitMacros(res, { a: unit })
}
