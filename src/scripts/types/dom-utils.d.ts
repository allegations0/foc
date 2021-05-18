
namespace setup {
  namespace DOM {

    type AttributeTypesOverrides = {
      style: string | Record<string, string>
    }

    type Attributes = {
      [k: string]: k extends keyof HTMLElementEventMap
        ? ((this: HTMLElement, ev: HTMLElementEventMap[k]) => any)
        : (k extends keyof AttributeTypesOverrides ? AttributeTypesOverrides[k] : string|number)
    }

    type Node = HTMLElement | DocumentFragment

    type Attachable = Node | Node[] | string | false | null | undefined

  }
}

//
// Declared in the global scope
//

/**
 * Tag function for JS tagged templates.
 * Inflates an HTML string with optional content
 * 
 * Usage example: (combined with helper functions in setup.DOM namespace)
 * ```
    // Value of content will be a DOM node (either an Element or a DocumentFragment)
    const content = html`
      <div class="some-class" style="${some_string_variable}">

        <p>Raw html here</p>

        ${twee`<<message 'here comes a twee macro (mostly for backwards compat / temporary')>>`}

        ${some_array.map(value => html`<span>value inside a loop: ${value}</span>`)}

        ${setup.DOM.createRefreshable("div", { id: 'my_refreshable_id' }, () => {
          // callback that re-renders the content when the div is refreshed via setup.DOM.refresh
          return html`<span>some refreshable html, timestamp: ${Date.now()}</span>`
        })}

        ${setup.DOM.create('button', { // this allows setting event listeners
          click() { setup.DOM.refresh('#my_refreshable_id') }
        }, "I'm a button, click me to refresh the div above")}
      </div>
    `;

 * ```
 */
declare function html(strings: TemplateStringsArray, ...values: any[]): DocumentFragment|HTMLElement

/**
 * Tag function for JS tagged templates.  
 * Same as `html` tag function, but instead parses the string code as TWEE instead of HTML (i.e. it runs twee widget/macros)  
 * It is slower, prefer to use `html` when possible. Should only be used for backwards compatibility / transitioning code  
 */
declare function twee(strings: TemplateStringsArray, ...values: any[]): DocumentFragment|HTMLElement
