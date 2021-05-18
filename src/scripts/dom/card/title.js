import { domCardNameBold } from "../util/cardnamerep"

/**
 * @param {setup.Title} title
 * @returns {setup.DOM.Node}
 */
setup.DOM.Card.title = function (title) {
  const fragments = []

  {
    const inner_fragments = []
    inner_fragments.push(html`
      ${domCardNameBold(title)}
    `)

    const value = title.getSlaveValue()
    if (value) {
      inner_fragments.push(html`
        <span class='toprightspan'>
          Value: ${setup.DOM.Util.money(value)}
        </span>
      `)
    }
    fragments.push(setup.DOM.create('div', {}, inner_fragments))
  }

  const explanation = setup.SkillHelper.explainSkills(title.getSkillAdds())
  if (explanation) {
    fragments.push(setup.DOM.create('div', {}, explanation))
  }

  fragments.push(html`
    <div>
      ${setup.DOM.Util.twine(title.getDescription())}
    </div>
  `)

  return setup.DOM.create('div', { class: 'titlecard' }, fragments)
}
