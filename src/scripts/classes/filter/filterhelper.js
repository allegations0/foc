import { up, down } from "./AAA_filter"

setup.FilterHelper = {}

/**
 * Various helper menu objects for making menus
 */
export class MenuFilterHelper extends setup.TwineClass {
  static namedown = {
    title: down('Name'),
    sort: (a, b) => a.getName().localeCompare(b.getName()),
  }

  static nameup = {
    title: up('Name'),
    sort: (a, b) => b.getName().localeCompare(a.getName()),
  }

  static leveldown = {
    title: down('Level'),
    sort: (a, b) => a.getLevel() - b.getLevel(),
  }

  static levelup = {
    title: up('Level'),
    sort: (a, b) => b.getLevel() - a.getLevel(),
  }

  static joindown = {
    title: down('Join'),
    sort: (a, b) => b.getWeeksWithCompany() - a.getWeeksWithCompany(),
  }

  static joinup = {
    title: up('Join'),
    sort: (a, b) => a.getWeeksWithCompany() - b.getWeeksWithCompany(),
  }

  static slavevaluedown = {
    title: down('Value'),
    sort: (a, b) => a.getSlaveValue() - b.getSlaveValue(),
  }

  static slavevalueup = {
    title: up('Value'),
    sort: (a, b) => b.getSlaveValue() - a.getSlaveValue(),
  }

  static valuedown = {
    title: down('Value'),
    sort: (a, b) => a.getValue() - b.getValue(),
  }

  static valueup = {
    title: up('Value'),
    sort: (a, b) => b.getValue() - a.getValue(),
  }

  static sluttinessdown = {
    title: down('Sluttiness'),
    sort: (a, b) => a.getSluttiness() - b.getSluttiness(),
  }

  static sluttinessup = {
    title: up('Sluttiness'),
    sort: (a, b) => b.getSluttiness() - a.getSluttiness(),
  }

  static templateleveldown = {
    title: down('Level'),
    sort: (a, b) => a.getTemplate().getDifficulty().getLevel() - b.getTemplate().getDifficulty().getLevel(),
  }

  static templatelevelup = {
    title: up('Level'),
    sort: (a, b) => b.getTemplate().getDifficulty().getLevel() - a.getTemplate().getDifficulty().getLevel(),
  }

  static difficultyleveldown = {
    title: down('Level'),
    sort: (a, b) => a.getDifficulty().getLevel() - b.getDifficulty().getLevel(),
  }

  static difficultylevelup = {
    title: up('Level'),
    sort: (a, b) => b.getDifficulty().getLevel() - a.getDifficulty().getLevel(),
  }
}


/**
 * Helper method for filterall to load the items faster
 * @param {Object[]} filter_objects 
 * @param {Object[]} display_objects 
 * @param {string} payload 
 * @returns {setup.DOM.Node}
 */
setup.FilterHelper.loadItemsFast = function(filter_objects, display_objects, payload) {
  const fragments = []
  for (let i = 0; i < filter_objects.length; ++i) {
    if (display_objects) {
      State.temporary.displayobj = display_objects[i]
    } else {
      State.temporary.displayobj = filter_objects[i]
    }
    State.temporary.filterobj = filter_objects[i]

    const wikifier = new Wikifier(null, `<div data-filter-key="${filter_objects[i].key}"></div>`)
    const $elem = $(wikifier.output.firstElementChild)
    $elem.wiki(`<<capture _filterobj _displayobj>>${payload}<</capture>>`)
    fragments.push($elem.get(0))
  }
  return setup.DOM.create(
    'div',
    {style: 'display: flex; flex-direction: column;'},
    fragments,
  )
}
