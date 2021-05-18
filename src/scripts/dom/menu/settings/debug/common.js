import { IMPORTABLE } from "../settings"

/**
 * @param {setup.ActivityInstance | setup.QuestInstance | setup.EventInstance | setup.OpportunityInstance | setup.InteractionInstance} instance
 * @param {boolean} is_all
 * @returns {setup.DOM.Node}
 */
export function debug_do_one_title(instance, is_all) {
  if (is_all) return html`
    <div>
      ${setup.DOM.Util.name(instance)}
    </div>
  `
  return html`
    <div>
      ${twee`<<back>>`}
    </div>

    <div>
    ${(!is_all && State.variables.devtooltype) ?
      html`
        ${setup.DOM.Text.successlite('The content you have made is now in the game.')}
        You can load your existing save file
        ${setup.DOM.Text.danger('FROM THIS SCREEN')}
        if you want to try playing with the content you just add in an actual game.
      `
      : ''}
    </div>

    <div>
      ${setup.DOM.Util.message(
        '(show generated actors)',
        setup.DOM.Card.notifications(),
      )}
    </div>

    <div>
      ${setup.DOM.Util.name(instance)}
    </div>
  `
}

/**
 * @param {setup.ActivityInstance | setup.QuestInstance | setup.EventInstance | setup.OpportunityInstance | setup.InteractionInstance} instance
 * @param {boolean} is_all
 * @returns {setup.DOM.Node}
 */
export function debug_do_one_finalize(instance, is_all) {
  if (is_all) {
    instance.debugKillActors()
  }

  return null
}

/**
 * @param {string} content_name
 * @param {string} all_passage
 * @returns {setup.DOM.Node}
 */
export function debug_frontpage_title(content_name, all_passage) {
  return html`
    <h2>Select ${content_name} to try</h2>
    <div>
      ${setup.DOM.Nav.move('(Return)', 'SettingsMenu')}
    </div>
    <div>
      ${twee`[[(Test All)|${all_passage}]]`}
    </div>
  `
}
