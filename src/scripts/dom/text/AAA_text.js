setup.DOM.Text = {}

/**
 * <<successtext>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.success = function (text) {
  return html`<span class='successtext'>${text.toString()}</span>`
}

/**
 * <<successtextlite>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.successlite = function (text) {
  return html`<span class='successtextlite'>${text.toString()}</span>`
}


/**
 * <<dangertext>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.danger = function (text) {
  return html`<span class='dangertext'>${text.toString()}</span>`
}

/**
 * <<dangertextlite>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.dangerlite = function (text) {
  return html`<span class='dangertextlite'>${text.toString()}</span>`
}


/**
 * <<infotext>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.info = function (text) {
  return html`<span class='infotext'>${text.toString()}</span>`
}

/**
 * <<infotextlite>>
 * @param {any} text
 * @returns {setup.DOM.Node}
 */
setup.DOM.Text.infolite = function (text) {
  return html`<span class='infotextlite'>${text.toString()}</span>`
}

