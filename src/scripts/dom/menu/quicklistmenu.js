/*
Originally from:
http://twinery.org/forum/discussion/comment/17617/
*/

import { menuItem } from "../../ui/menu"

/**
 * Display toolbars for quick menu on top right
 * 
 * @returns {setup.DOM.Node}
 */
setup.DOM.Menu.quicklistmenu = function () {

  const menus = {
    unit: 'Unit',
    quest: 'Quest',
    slaveorder: 'Order',
  }

  function menuItemCallback(keyword) {
    return () => {
      State.variables.settings.rightsidebar = keyword
      setup.runSugarCubeCommand(`<<refreshmenu>>`)
    }
  }

  const menu_items = []
  for (const keyword in menus) {
    if (keyword == 'slaveorder' && !State.variables.fort.player.isHasBuilding('marketingoffice')) continue
    const is_selected = (State.variables.settings.rightsidebar == keyword)
    const text = menus[keyword]
    if (is_selected) {
      menu_items.push(menuItem({
        text: text,
        cssclass: is_selected ? 'submenu-tag-selected' : '',
      }))
    } else {
      menu_items.push(menuItem({
        text: text,
        cssclass: is_selected ? 'submenu-tag-selected' : '',
        callback: menuItemCallback(keyword),
      }))
    }
  }

  return setup.DOM.create('div', { class: 'menu toolbar' }, setup.DOM.Util.menuItemToolbar(menu_items))
}

