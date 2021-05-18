import { menuItemAction, menuItemText, menuItemTitle } from "../../ui/menu"
import { domCardRep } from "../util/cardnamerep"
import { buildingTemplateDescriptionFragment, buildingTemplateNameFragment } from "./building_common"

/**
 * @param {setup.RoomInstance} room
 * @returns {setup.DOM.Node}
 */
function roomNameFragment(room) {
  const fragments = []
  fragments.push(html`${room.getTemplate().repTags()}`)
  fragments.push(html`${domCardRep(room)}`)
  fragments.push(html`(${room.getTemplate().getWidth()}x${room.getTemplate().getHeight()})`)
  return setup.DOM.create('span', {}, fragments)
}

/**
 * @param {setup.RoomTemplate} room_template
 * @returns {setup.DOM.Node}
 */
export function roomTemplateNameFragment(room_template) {
  const fragments = []
  fragments.push(html`${room_template.repTags()}`)
  fragments.push(html`${domCardRep(room_template)}`)
  fragments.push(html`(${room_template.getWidth()}x${room_template.getHeight()})`)
  return setup.DOM.create('span', {}, fragments)
}

/**
 * @param {setup.RoomTemplate} template
 * @param {boolean} hide_actions 
 * @returns {JQLite[]}
 */
function roomTemplateActionFragmentCommon(template, hide_actions) {
  const menus = []
  const placed = State.variables.roomlist.getRoomCount(template)
  if (placed.placed + placed.unplaced) {
    let text
    if (placed.placed && !placed.unplaced) {
      text = `${placed.placed > 1 ? `${placed.placed} placed` : `Placed`}`
    } else if (!placed.placed) {
      text = html`${placed.unplaced} ${setup.DOM.Text.dangerlite('not placed')}`
    } else {
      text = `${placed.placed}/${placed.placed + placed.unplaced} placed`
    }
    menus.push(menuItemText({
      text: text
    }))
  }

  const building = template.getBuildingTemplate()
  if (building) {
    menus.push(menuItemText({
      text: buildingTemplateNameFragment(building)
    }))
  }
  return menus
}

/**
 * @param {setup.RoomTemplate} template 
 * @returns {setup.RoomInstance | null}
 */
export function getUnplacedRoom(template) {
  const unplaced = State.variables.roomlist.getUnplacedRooms().filter(
    test_room => test_room.getTemplate() == template)
  if (!unplaced.length) return null
  return unplaced[0]
}

/**
 * @param {setup.RoomInstance} room 
 * @param {boolean} hide_actions 
 * @returns {JQLite[]}
 */
function roomInstanceNameActionMenu(room, hide_actions) {
  /**
   * @type {JQLite[]}
   */
  const menus = []

  menus.push(menuItemTitle({
    text: roomNameFragment(room),
  }))

  if (!hide_actions && State.variables.roomlist.getRoomCount(room.getTemplate()).unplaced) {
    menus.push(menuItemAction({
      text: `Place`,
      tooltip: `Place this room somewhere on your fort`,
      callback: () => {
        // find an unplaced room
        const unplaced = getUnplacedRoom(room.getTemplate())
        unplaced.resetRotation()

        // @ts-ignore
        State.variables.gFortGridPlaceRoomKey = unplaced.key
        State.variables.gFortGridControl.mode = 'place'
        State.variables.gFortGridControl.setRoom(unplaced, /* save location = */ false)
        setup.DOM.Nav.goto('FortGridPlace')
      },
    }))

    menus.push(menuItemAction({
      text: `Auto-place`,
      tooltip: `Automatically place this room somewhere on your fort`,
      callback: () => {
        const unplaced = getUnplacedRoom(room.getTemplate())
        if (State.variables.fortgrid.placeAnywhere(unplaced)) {
          setup.DOM.Nav.goto()
        } else {
          setup.DOM.Nav.goto()
        }
      },
    }))
  }

  menus.push(...roomTemplateActionFragmentCommon(room.getTemplate(), hide_actions))

  return menus
}

/**
 * @param {setup.RoomTemplate} template
 * @param {boolean} hide_actions 
 * @returns {JQLite[]}
 */
function roomTemplateNameActionMenu(template, hide_actions) {
  /**
   * @type {JQLite[]}
   */
  const menus = []

  menus.push(menuItemTitle({
    text: roomTemplateNameFragment(template),
  }))

  menus.push(...roomTemplateActionFragmentCommon(template, hide_actions))

  return menus
}

/**
 * @param {setup.RoomTemplate} template
 * @returns {setup.DOM.Node}
 */
function artContributorWanted(template) {
  return html`
    <div class="graytext">
      ${setup.DOM.Text.successlite('Contributors wanted!')}
      This room currently does not have any images.
      See <a target="_blank" href="https://gitgud.io/darkofocdarko/fort-of-chains/-/issues/290">here</a>
      for more information.
      Images for this room would go into the
      "img/room/${template.key}/" folder.
    </div>`
}

/**
 * @param {setup.RoomInstance} room 
 * @returns {setup.DOM.Node}
 */
function getArtCreditFragment(room) {
  const room_image = room.getImageObject()
  if (room_image) {
    return setup.DOM.Util.Image.credits(room_image.info)
  } else {
    return html`<br/>${artContributorWanted(room.getTemplate())}`
  }
}

/**
 * @param {setup.RoomTemplate} template 
 * @param {boolean} hide_actions 
 * @returns {setup.DOM.Node}
 */
function getRoomAndTemplateCommonFragment(template, hide_actions) {
  const fragments = []
  if (template.getDescriptionPassage()) {
    fragments.push(setup.DOM.create('div', {}, setup.DOM.Util.include(template.getDescriptionPassage())))
  } else {
    const building = template.getBuildingTemplate()
    if (building) {
      fragments.push(buildingTemplateDescriptionFragment(building))
    }
  }

  // explain adjacency bonuses
  if (State.variables.gDebug || State.variables.fort.player.isHasBuilding(setup.buildingtemplate.landscapingoffice)) {
    const adjacency = template.getSkillBonus()
    /**
     * @type {Object<string, {type: string, bonus: number, skill: setup.Skill, templates: setup.RoomTemplate[]}>}
     */
    const bonskill = {}
    for (const adj of adjacency) {
      if (adj.type == 'always') {
        fragments.push(html`
          <div>Grant ${adj.bonus.toFixed(2)} ${setup.skill[adj.skill_key].rep()}.</div>
        `)
      } else {
        const room_template_key = adj.room_template_key
        /**
         * @type {setup.RoomTemplate}
         */
        const template = setup.roomtemplate[room_template_key]
        if (!template) throw new Error(`Missing room with template ${room_template_key}!`)
        const building = template.getBuildingTemplate()
        if (building) {
          if (!State.variables.gDebug && !State.variables.fort.player.isHasBuilding(building) && building.isHidden()) {
            // hide adjacency information
            continue
          }
        }
        const key = JSON.stringify([setup.skill[adj.skill_key].key, adj.type, adj.bonus])
        if (!(key in bonskill)) {
          bonskill[key] = {
            type: adj.type,
            bonus: adj.bonus,
            skill: setup.skill[adj.skill_key],
            templates: [],
          }
        }
        bonskill[key].templates.push(template)
      }
    }

    const map_keys = Object.keys(bonskill)
    map_keys.sort()
    for (const map_key of map_keys) {
      const skill_obj = bonskill[map_key]
      const room_reps = skill_obj.templates.map(template => template.rep()).join(', ')
      if (skill_obj.type == 'adjacent') {
        fragments.push(html`
            <div>Grant ${skill_obj.bonus.toFixed(2)} ${skill_obj.skill.rep()} for every ${setup.DOM.Text.dangerlite('directly adjacent')}: ${room_reps}.</div>
          `)
      } else if (skill_obj.type == 'near') {
        fragments.push(html`
          <div>Grant ${skill_obj.bonus.toFixed(2)} ${skill_obj.skill.rep()} for every
          <span data-tooltip="Entrances within ${setup.FORTGRID_NEAR_DISTANCE} tiles of each other">nearby</span>: ${room_reps}.
          </div>
        `)
      } else {
        throw new Error(`Unrecognized adjacency type: ${skill_obj.type}`)
      }
    }
  }

  return setup.DOM.create('div', {}, fragments)
}

/**
 * @param {setup.RoomInstance} room 
 * @returns {setup.DOM.Node}
 */
function fullAdjacencyExplanation(room) {
  if (!room.getLocation()) {
    return html`Room is not currently placed in your fort.`
  }

  const fragments = []
  const raw_res = State.variables.fortgrid.getAffectingRooms(
    room,
    room.getLocation()
  )
  const affectors = raw_res.skill_to_room
  const skill_bonuses = raw_res.skill_bonuses
  for (let i = 0; i < affectors.length; ++i) {
    const rooms = affectors[i]
    if (rooms.length) {
      fragments.push(
        html`
          <div>
            ${skill_bonuses[i].toFixed(1)} ${setup.skill[i].rep()} from ${rooms.map(room => room.rep()).join(', ')}
          </div>
        `
      )
    }
  }
  return setup.DOM.create('div', {}, fragments)
}

/**
 * @param {setup.RoomInstance} room
 * @param {boolean} [hide_actions]
 * @returns {setup.DOM.Node}
 */
setup.DOM.Card.roominstance = function (room, hide_actions) {
  const fragments = []
  fragments.push(setup.DOM.Util.menuItemToolbar(roomInstanceNameActionMenu(room, hide_actions)))

  if (State.variables.fort.player.isHasBuilding(setup.buildingtemplate.landscapingoffice)) {
    const explanation = setup.SkillHelper.explainSkills(
      room.getSkillBonuses(), /* hide skills = */ false, /* to fixed = */ true,
    )
    if (explanation) {
      fragments.push(html`<div>Current effects: ${explanation} ${setup.DOM.Util.message(
        `(full details)`,
        () => html`<div class='helpcard'>${fullAdjacencyExplanation(room)}</div>`
      )}</div>`)
    }
  }

  fragments.push(getRoomAndTemplateCommonFragment(room.getTemplate(), hide_actions))

  fragments.push(getArtCreditFragment(room))

  const divclass = `card roominstancecard`
  return setup.DOM.create(
    'div',
    { class: divclass },
    fragments,
  )
}


/**
 * @param {setup.RoomInstance} room
 * @param {boolean} [hide_actions]
 * @returns {setup.DOM.Node}
 */
setup.DOM.Card.roominstancecompact = function (room, hide_actions) {
  return setup.DOM.Util.menuItemToolbar(roomInstanceNameActionMenu(room, hide_actions))
}


/**
 * @param {setup.RoomTemplate} template
 * @param {boolean} [hide_actions]
 * @returns {setup.DOM.Node}
 */
setup.DOM.Card.roomtemplate = function (template, hide_actions) {
  const fragments = []
  fragments.push(setup.DOM.Util.menuItemToolbar(roomTemplateNameActionMenu(template, hide_actions)))

  if (State.variables.gDebug && !template.getImageList().length) {
    fragments.push(artContributorWanted(template))
  }

  fragments.push(getRoomAndTemplateCommonFragment(template, hide_actions))

  const divclass = `card roomtemplatecard`
  return setup.DOM.create(
    'div',
    { class: divclass },
    fragments,
  )
}


/**
 * @param {setup.RoomTemplate} template
 * @param {boolean} [hide_actions]
 * @returns {setup.DOM.Node}
 */
setup.DOM.Card.roomtemplatecompact = function (template, hide_actions) {
  return setup.DOM.Util.menuItemToolbar(roomTemplateNameActionMenu(template, hide_actions))
}

