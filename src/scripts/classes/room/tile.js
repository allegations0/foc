const ZOOM_AMOUNT = {
  zoom0_25: 0.25,
  zoom0_5: 0.5,
  zoom0_75: 0.75,
  zoom1_25: 1.25,
  zoom1_5: 1.5,
  zoom2: 2.0,
  zoom3: 3.0,
  zoom4: 4.0,
}

function encode(topdown, leftright, corner) {
  if (topdown && leftright && corner) return 4
  return topdown + leftright * 2
}

/**
 * Tiles in the FortGrid
 */
setup.Tile = class Tile extends setup.TwineClass {
  /**
   * @param {TileLocation} location
   */
  constructor(location) {
    super()

    this.location = location

    this.room_key = null

    // this is the entrance of these rooms
    this.room_key_entrances = []
    this.is_top_left_of_room = false
    this.is_path = false
  }

  isPath() {
    return this.is_path
  }

  setPath() {
    this.is_path = true
  }

  removePath() {
    this.is_path = false
  }

  /**
   * @returns {number[]}
   */
  getPathDirectionId() {
    const location = this.getLocation()
    let walls = []
    for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [-1, 1], [1, 1], [1, -1]]) {
      const neighbor = {
        row: location.row + dr,
        col: location.col + dc,
      }
      if (State.variables.fortgrid.isOutOfBounds(neighbor)) {
        walls.push(0)
        continue
      }
      let ok = 0
      const tile = State.variables.fortgrid.getTile(neighbor)
      if (tile.isPath()) {
        ok = 1
      }
      if (!ok && !tile.isPassable()) {
        // check if it's entrance
        const room = tile.getRoomInstance()
        if (room.getTemplate().isHasDoor()) {
          const loc = tile.getRoomInstance().getEntranceLocation()
          if (loc.row == location.row && loc.col == location.col) {
            ok = 1
          }
        }
      }
      walls.push(ok)
    }

    return [
      encode(walls[0], walls[3], walls[4]),
      encode(walls[0], walls[1], walls[5]),
      encode(walls[2], walls[1], walls[6]),
      encode(walls[2], walls[3], walls[7]),
    ]
  }

  /**
   * @param {setup.RoomInstance} room_instance 
   * @param {boolean} is_top_left_of_room 
   */
  setRoomInstance(room_instance, is_top_left_of_room) {
    if (this.room_key) throw new Error(`Duplicate room on the same tile: ${this.location.row} ${this.location.col} ${this.room_key}`)
    this.room_key = room_instance.key
    this.is_top_left_of_room = is_top_left_of_room
  }

  unsetRoomInstance() {
    this.room_key = null
    this.is_top_left_of_room = false
  }

  /**
   * @param {setup.RoomInstance} room_instance 
   */
  setEntranceOf(room_instance) {
    this.room_key_entrances.push(room_instance.key)
  }

  /**
   * @param {setup.RoomInstance} room_instance 
   */
  unsetEntranceOf(room_instance) {
    if (!this.room_key_entrances.includes(room_instance.key)) throw new Error(`unsetting entrance of something that does not exist`)
    this.room_key_entrances = this.room_key_entrances.filter(key => key != room_instance.key)
  }

  /**
   * 
   * @returns {TileLocation}
   */
  getLocation() { return this.location }

  /**
   * @returns {setup.RoomInstance | null}
   */
  getRoomInstance() {
    if (!this.room_key) return null
    return State.variables.roominstance[this.room_key]
  }

  /**
   * @returns {setup.RoomInstance[]}
   */
  entranceOfRooms() {
    return this.room_key_entrances.map(key => State.variables.roominstance[key])
  }

  /**
   * @returns {boolean}
   */
  isTopLeftOfRoom() {
    return this.is_top_left_of_room
  }

  isOutdoors() {
    return this.getLocation().row > 0
  }

  /**
   * @returns {boolean}
   */
  isPassable() {
    const room = this.getRoomInstance()
    if (!room) return true
    return room.getTemplate().isPassable()
  }

  isWalled() {
    const room = this.getRoomInstance()
    if (!room) return false
    return room.isWalled()
  }

  /**
   * @returns {string}
   */
  getTileDisplay() {
    const room = this.getRoomInstance()
    if (room && !this.isTopLeftOfRoom()) return ''
    let image_path_raw
    let tooltip
    let width
    let height
    let divwidth
    let divheight
    let is_entrance_to_top = false

    let location
    if (this.isOutdoors()) {
      location = 'outdoors'
    } else {
      location = 'indoors'
    }

    let rotatestyle = ''
    let classes = []
    let imgclass = ['tile-main-image']
    let rng = setup.rng.choice([1, 2, 3, 4])
    const tile_size = Tile.getTileSize()
    if (room) {
      image_path_raw = room.getImage()
      tooltip = `<<roominstancecardkey ${room.key}>>`
      divwidth = room.getWidth() * tile_size
      divheight = room.getHeight() * tile_size
      width = room.getTemplate().getWidth() * tile_size
      height = room.getTemplate().getHeight() * tile_size

      rotatestyle = ''

      if (room.isShouldRotateImage()) {
        // center image first
        if (width != divwidth || height != divheight) {
          rotatestyle += `translate(${(divwidth - width) / 2}px, ${(divheight - height) / 2}px)`
        }
        const rotation = room.getClockwiseRotations()
        if (rotation) {
          rotatestyle += ` rotate(${90 * rotation}deg)`
        }
      } else {
        width = divwidth
        height = divheight
      }

    } else {
      divwidth = divheight = width = height = tile_size
      if (this.entranceOfRooms().filter(room => room.isWalled() && room.getClockwiseRotations() == 0).length) {
        image_path_raw = `img/room/${location}_entrance${rng}.png`
        is_entrance_to_top = true
      } else {
        image_path_raw = `img/room/${location}_empty${rng}.png`
      }
      tooltip = ``
    }

    classes.push(`tile-${location}`)

    if (!room) {
      if (this.entranceOfRooms().length) {
        imgclass.push('tile-entrance')
      } else {
        imgclass.push('tile-empty')
      }
    } else if (!room.getImageObject()) {
      imgclass.push(`tile-type-${room.getTemplate().getTypeTag()}`)
    }

    if (State.variables.menufilter.get('fortgrid', 'show_tooltip') == 'hide') {
      tooltip = ``
    }

    let caption = ''
    if (
      room &&
      !room.getTemplate().isHideName() &&
      State.variables.menufilter.get('fortgrid', 'show_caption') != 'hide'
    ) {
      caption += `<div class='tile-caption'>${room.getName()}</div>`
    }

    if (
      room &&
      !room.getTemplate().isHideSkill() &&
      State.variables.menufilter.get('fortgrid', 'show_skills') != 'hide'
    ) {
      const explanation = setup.SkillHelper.explainSkills(
        room.getSkillBonuses(), /* hide skills = */ false, /* is to fixed = */ true)
      if (explanation) {
        caption += `<div class='tile-caption-bottom'>${explanation}</div>`
      }
    }

    let extras = ''
    // Draw path underneath if necessary
    if (!room && this.isPath()) {
      const dirs = this.getPathDirectionId()
      let tile_size_half = tile_size / 2
      for (let [i, dir, offdr, offdc] of [[0, 'nw', 0, 0], [1, 'ne', 0, 1], [2, 'se', 1, 1], [3, 'sw', 1, 0]]) {
        const tile_image = `img/room/${location}-path-${dir}-${dirs[i]}.png`
        const tile_url = setup.escapeHtml(setup.resolveImageUrl(tile_image))
        // @ts-ignore
        extras += `<div class="tile-path" style="width: ${tile_size_half}px; height: ${tile_size_half}px; top:${tile_size_half * offdr}px; left:${tile_size_half * offdc}px"><img style="width:${tile_size_half}px; height:${tile_size_half}px;" src="${tile_url}"/></div>`
      }
    }

    // Draw walls at the top if necessary.
    if (!is_entrance_to_top && !this.isWalled()) {
      for (let dc = 0; dc < (room ? room.getWidth() : 1); ++dc) {
        const loc = {
          row: this.getLocation().row - 1,
          col: this.getLocation().col + dc
        }
        if (!State.variables.fortgrid.isOutOfBounds(loc)) {
          const tileabove = State.variables.fortgrid.getTile(loc)
          if (tileabove.isWalled()) {
            // draw extra wall here
            const wall_image = `img/room/${location}_wall${rng}.png`
            const wall_url = setup.escapeHtml(setup.resolveImageUrl(wall_image))
            extras += `<div class="tile-extra-wall" style="top:0px; left:${tile_size * dc}px"><img style="width:${tile_size}px; height:${tile_size}px;" src="${wall_url}"/></div>`
          }
        }
      }
    }

    // draw activity units
    let outer_extra = ''
    if (
      room &&
      State.variables.gFortGridControl &&
      State.variables.gFortGridControl.mode == 'view' &&
      State.variables.menufilter.get('fortgrid', 'show_activities') != 'hide'
    ) {
      const activity = State.variables.activitylist.getActivityAt(room)
      if (activity) {
        outer_extra += `<span class='activity-unit-container'>${activity.getDisplay()}</span>`
      }
    }

    // background tile
    const tile_path_raw = `img/room/${location}_floor${rng}.png`
    const tile_url = setup.escapeHtml(setup.resolveImageUrl(tile_path_raw))
    const url = setup.escapeHtml(setup.resolveImageUrl(image_path_raw))
    return `${outer_extra}<div style="background-image: url('${tile_url}'); width:${divwidth}px; height:${divheight}px" class="${classes.join(' ')}" ${tooltip ? `data-tooltip="${tooltip}"` : ''}>${extras}<img ${rotatestyle ? `style="transform: ${rotatestyle};"` : ''} width="${width}" height="${height}" class="${imgclass.join(' ')}" src="${url}"/>${caption}</div>`
  }

  static getTileSize() {
    const zoom = State.variables.menufilter.get('fortgrid', 'zoom')
    if (zoom) {
      return Math.round(setup.FORTGRID_TILE_SIZE * ZOOM_AMOUNT[zoom])
    } else {
      return setup.FORTGRID_TILE_SIZE
    }
  }
}
