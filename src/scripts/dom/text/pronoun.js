import { pronouns } from '../../lib/pronouns'

setup.DOM.Pronoun = {}
setup.DOM.PronounYou = {}

function getFunc(index) {
  return (unit) => {
    if (unit.isMale()) return pronouns.he[index]
    return pronouns.she[index]
  }
}

function getFuncYou(index) {
  return (unit) => {
    if (unit.isYou() && index < pronouns.you.length) return pronouns.you[index]
    if (unit.isMale()) return pronouns.he[index]
    return pronouns.she[index]
  }
}

for (let i = 0; i < pronouns.they.length; ++i) {
  setup.DOM.Pronoun[pronouns.they[i]] = getFunc(i)
  setup.DOM.PronounYou[pronouns.they[i]] = getFuncYou(i)
}
