/**
 * @param {setup.Unit} unit
 * @returns {setup.DOM.Node}
 */
setup.DOM.Menu.changeactivetitles = function (unit) {
  const fragments = []
  fragments.push(html`
    <div>
      Change ${unit.rep()}'s active titles.
      ${setup.DOM.Util.help(html`
        While a unit can have multiple titles, they can only have at most three active at any time:
        two titles that you can freely choose, plus their last obtained title.
        These active titles will be the only titles that confer their benefits (e.g.,
        skills).
        The unit is still considered to have all the other titles -- they just won't affect gameplay.
      `)}
    </div>
  `)
  fragments.push(setup.DOM.Card.unit(unit, /* hide actions = */ true))

  const last = State.variables.titlelist.getLastTitle(unit)
  if (last) {
    fragments.push(html`
      <div>
        Last obtained title:
        ${setup.DOM.Util.help(html`
          Last obtained title is always included as one of the unit's active titles, regardless of whether
          it is chosen below or not.
        `)}
        ${last.rep()}
      </div>
    `)
  }

  const assigned = State.variables.titlelist.getAssignedTitles(unit, /* base only = */ true)
  assigned.forEach(title => {
    fragments.push(html`
      <div>
        ${title.rep()}
        ${setup.DOM.Nav.link(
      `(Change active title)`,
      () => {
        setup.DevToolHelper.pickTitle(
          State.variables.titlelist.getAllTitles(unit).filter(
            ftitle => !assigned.includes(ftitle)
          )
        ).then(picked => {
          if (picked) {
            State.variables.titlelist.unassignTitle(unit, title)
            State.variables.titlelist.assignTitle(unit, picked)
            setup.DOM.Nav.goto()
          }
        })
      }
    )}
      </div>
    `)
  })

  fragments.push(html`<div>${setup.DOM.Nav.return('(finish)')}</div>`)
  setup.DOM.Nav.topLeftNavigation(setup.DOM.Nav.return('Finish'))
  return setup.DOM.create('div', {}, fragments)
}
