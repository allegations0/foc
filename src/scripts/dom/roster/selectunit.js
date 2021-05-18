import { menuItemAction } from "../../ui/menu"

/**
 * @typedef {Object} RosterSelectUnitArgs
 * @property {setup.Unit[]} units
 * @property {string} return_passage
 * 
 * @param {RosterSelectUnitArgs} args 
 * @returns {setup.DOM.Node}
 */
setup.DOM.Roster.selectunit = function ({ units, return_passage }) {
  const fragments = []
  fragments.push(html`<div>${setup.DOM.Nav.return('(Cancel)')}</div>`)
  if (!units.length) {
    fragments.push(html`
      <div>
        ${setup.DOM.Text.danger(`No eligible unit.`)}
      </div>
    `)
  } else {
    fragments.push(setup.DOM.Roster.show({
      units: units,
      menu: 'unit',
      actions_callback: (unit) => [
        menuItemAction({
          text: `Select`,
          callback: () => {
            // @ts-ignore
            State.variables.gUnitSelected_key = unit.key
            return setup.DOM.Util.include(return_passage)
          },
        })
      ],
    }))
  }
  return setup.DOM.create(`div`, {}, fragments)
}
