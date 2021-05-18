import { FortGridBase } from "./fortgridbase"

/**
 * The grid representing your fort. Does not actually get stored,
 * but gets recomputed each time.
 * 
 * FortGrid code is divided into two parts; FortGridBase and FortGrid itself.
 * The base stores the getter/setter and basic info, while the FortGrid implements
 * the algorithm-heavy procedures.
 */
setup.FortGrid = class FortGrid extends FortGridBase {
  /**
   * @returns {Array<Array<setup.Tile>>}
   */
  _makeEmptyTiles() {
    const result = []
    for (let row = -this.getIndoorHeight() + 1; row <= this.getOutdoorHeight(); row += 1) {
      const row_ele = []
      for (let col = 0; col < this.getWidth(); ++col) {
        row_ele.push(new setup.Tile({ row: row, col: col }))
      }
      result.push(row_ele)
    }
    return result
  }

  // called after load save
  removeIntersectingRooms() {
    const used = []
    for (let row = -this.getIndoorHeight() + 1; row <= this.getOutdoorHeight(); row += 1) {
      const row_ele = []
      for (let col = 0; col < this.getWidth(); ++col) {
        row_ele.push(false)
      }
      used.push(row_ele)
    }

    for (const room of State.variables.roomlist.getRoomInstances().filter(
      room => room.isPlaced())) {
      const room_loc = room.getLocation()
      const width = room.getWidth()
      const height = room.getHeight()
      let is_ok = true
      for (let i = 0; i < width; ++i) {
        for (let j = 0; j < height; ++j) {
          const location = {
            row: room_loc.row + j,
            col: room_loc.col + i,
          }
          if (this.isOutOfBounds(location)) {
            is_ok = false
            break
          }
          const translated = this.translateLocationToArrayIndex({
            row: room_loc.row + j,
            col: room_loc.col + i,
          })
          if (used[translated.idx1][translated.idx2]) {
            is_ok = false
            break
          } else {
            used[translated.idx1][translated.idx2] = true
          }
        }
        if (!is_ok) break
      }
      if (room.getTemplate().isHasDoor()) {
        const entrance = room.getEntranceLocation()
        if (this.isOutOfBounds(entrance)) {
          is_ok = false
        } else {
          const translated = this.translateLocationToArrayIndex(entrance)
          if (used[translated.idx1][translated.idx2]) {
            is_ok = false
          }
        }
      }
      if (!is_ok) {
        console.log(`Removing ${room.getTemplate().key} because its location is no longer valid`)
        room._relocate(null)
      }
    }

    State.variables.roomlist.resetCacheAll()
    this.recomputeTiles()

    // check if it cause the tile to be divided
    if (!this.isEmptySpaceRemainsConnected()) {
      console.log(`Removing all rooms because empty space becomes disconnected`)
      for (const room of State.variables.roomlist.getRoomInstances().filter(
        room => room.isPlaced() && !room.getTemplate().isFixed())) {
        room._relocate(null)
      }
      State.variables.roomlist.resetCacheAll()
      this.recomputeTiles()
    }
  }

  /**
   * @param {Array<Array<setup.Tile>>} tiles 
   */
  _fillTilesWithRooms(tiles) {
    // fill in the rooms
    for (const room of State.variables.roomlist.getRoomInstances().filter(room => room.isPlaced())) {
      const room_loc = room.getLocation()
      const width = room.getWidth()
      const height = room.getHeight()
      for (let i = 0; i < width; ++i) {
        for (let j = 0; j < height; ++j) {
          const translated = this.translateLocationToArrayIndex({
            row: room_loc.row + j,
            col: room_loc.col + i,
          })
          tiles[translated.idx1][translated.idx2].setRoomInstance(
            room,
            /* is top left = */(i == 0 && j == 0),
          )
        }
      }
      if (room.getTemplate().isHasDoor()) {
        const entrance = room.getEntranceLocation()
        const translated = this.translateLocationToArrayIndex(entrance)
        tiles[translated.idx1][translated.idx2].setEntranceOf(room)
      }
    }
  }

  recomputeTiles() {
    this.is_paths_computed = false
    const result = this._makeEmptyTiles()
    this._fillTilesWithRooms(result)
    this.cached_tiles = result
  }

  /**
   * @param {setup.RoomInstance} [room]
   * @param {TileLocation} [location_top_left]
   * @returns {Array<Array<{passable: boolean, visited: boolean}>>}
   */
  _makeDFSGraph(room, location_top_left) {
    const tiles = this.getTiles()
    const rows = tiles.length
    const cols = tiles[0].length

    let min_loc
    let max_loc
    if (location_top_left) {
      min_loc = State.variables.fortgrid.translateLocationToArrayIndex(location_top_left)
      max_loc = State.variables.fortgrid.translateLocationToArrayIndex({
        row: location_top_left.row + room.getHeight() - 1,
        col: location_top_left.col + room.getWidth() - 1
      })
    } else if (room) {
      const current = room.getLocation()
      min_loc = State.variables.fortgrid.translateLocationToArrayIndex(current)
      max_loc = State.variables.fortgrid.translateLocationToArrayIndex({
        row: current.row + room.getHeight() - 1,
        col: current.col + room.getWidth() - 1
      })
    } else {
      min_loc = null
      max_loc = null
    }

    const tile_copy = []
    for (let row = 0; row < rows; ++row) {
      const tile_copy_row = []
      for (let col = 0; col < cols; ++col) {
        let passable = tiles[row][col].isPassable()
        if (
          min_loc &&
          row >= min_loc.idx1 &&
          row <= max_loc.idx1 &&
          col >= min_loc.idx2 &&
          col <= max_loc.idx2
        ) {
          if (passable && location_top_left && !room.getTemplate().isPassable()) {
            // blocked by newly built room
            passable = false
          } else if (!passable && !location_top_left) {
            // now passable
            passable = true
          }
        }
        tile_copy_row.push({
          passable: passable,
          visited: false,
        })
      }
      tile_copy.push(tile_copy_row)
    }

    return tile_copy
  }

  /**
   * @param {Array<Array<{passable: boolean, visited: boolean}>>} graph
   * @param {[number, number]} origin 
   * @returns {number}
   */
  _countReachableTiles(graph, origin) {
    const rows = graph.length
    const cols = graph[0].length

    // standard DFS
    const stack = []
    graph[origin[0]][origin[1]].visited = true
    stack.push(origin)
    let total = 0
    while (stack.length > 0) {
      total += 1
      const loc = stack.pop()
      for (const mod of [[-1, 0], [1, 0], [0, 1], [0, -1]]) {
        const newrow = loc[0] + mod[0]
        const newcol = loc[1] + mod[1]
        if (newrow >= 0 && newrow < rows && newcol >= 0 && newcol < cols) {
          if (graph[newrow][newcol].passable && !graph[newrow][newcol].visited) {
            graph[newrow][newcol].visited = true
            stack.push([newrow, newcol])
          }
        }
      }
    }

    return total
  }

  /**
   * @param {setup.RoomInstance} [room]
   * @param {TileLocation | null} [location_top_left]
   * @returns {boolean}
   */
  isEmptySpaceRemainsConnected(room, location_top_left) {
    const tile_copy = this._makeDFSGraph(room, location_top_left)
    const rows = tile_copy.length
    const cols = tile_copy[0].length

    // compute number of passable tiles, as well as put a source there.
    /**
     * @type {[number, number]}
     */
    let source = null
    let passable_cnt = 0
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        if (tile_copy[row][col].passable) {
          source = [row, col]
          passable_cnt += 1
        }
      }
    }

    // special case, top row cannot be full
    if (this.isCanExpandIndoor()) {
      if (tile_copy[0].map(tile => tile.passable).length == 0) {
        return false
      }
    }

    // all filled. should not happen, but just in case.
    if (!source) return true

    return this._countReachableTiles(tile_copy, source) == passable_cnt
  }

  /**
   * @param {setup.RoomInstance} room
   * @param {TileLocation | null} location_top_left
   * @param {boolean} [is_skip_pathing]  If true, will not check connectivity requirement
   * @returns {string | null}
   */
  checkRoomCanRelocateTo(room, location_top_left, is_skip_pathing) {
    if (location_top_left) {
      if (this.isRoomOutOfBounds(room, location_top_left)) {
        return `Room is outside of map boundary`
      }

      if (room.getTemplate().isHasDoor()) {
        const entrance = room.getEntranceLocation(location_top_left)
        if (this.isOutOfBounds(entrance)) {
          // door out of range
          return `Room entrance is outside of map boundary`
        }
        const tile = this.getTile(entrance)
        if (tile.getRoomInstance()) {
          // door must be empty
          return `Room entrance is blocked`
        }
      }

      for (let r = 0; r < room.getHeight(); ++r) {
        for (let c = 0; c < room.getWidth(); ++c) {
          const tile = this.getTile(
            { row: location_top_left.row + r, col: location_top_left.col + c })

          // must be indoor/outdoor
          if (tile.isOutdoors() != room.getTemplate().isOutdoors()) {
            if (room.getTemplate().isOutdoors()) {
              return `Room must be outdoors`
            } else {
              return `Room must be indoors`
            }
          }

          // cannot be occupied
          if (tile.getRoomInstance()) {
            return `Location is occupied`
          }

          // cannot be entrance of something
          if (tile.entranceOfRooms().length) {
            return `Cannot block the entrance of other rooms`
          }
        }
      }
    }

    if (!is_skip_pathing && !this.isEmptySpaceRemainsConnected(room, location_top_left)) {
      return `Room cannot divide the remaining empty spaces into two or more parts`
    }

    return null
  }

  /**
   * @param {setup.RoomInstance} room
   * @param {TileLocation} room_location
   * @returns {Object<number, boolean>}
   */
  _getAdjacentRoomKeys(room, room_location) {
    const fortgrid = State.variables.fortgrid

    /**
     * @type {Object<number, boolean>}
     */
    const adjacent_room_keys = {}
    for (let row = room_location.row - 1; row <= room_location.row + room.getHeight(); ++row) {
      for (let col = room_location.col - 1; col <= room_location.col + room.getWidth(); ++col) {
        const location = { row: row, col: col }
        if (this.isOutOfBounds(location)) continue
        const tile = fortgrid.getTile(location)
        const neighbor = tile.getRoomInstance()
        if (
          neighbor &&
          neighbor != room &&
          !(neighbor.key in adjacent_room_keys)) {
          adjacent_room_keys[neighbor.key] = true
        }
      }
    }
    return adjacent_room_keys
  }

  /**
   * @param {setup.RoomInstance} room
   * @param {TileLocation} room_location
   * @param {boolean} [is_for_path]
   * @returns {Object<number, TileLocation[]>}
   */
  _getNearbyRooms(room, room_location, is_for_path) {
    // next, get all nearby buildings as well as the path needed to go there
    /**
     * @type {Object<number, TileLocation[]>}
     */
    const nearby_room_keys = {}
    const nearby_limit = setup.FORTGRID_NEAR_DISTANCE

    /**
     * @param {TileLocation} location 
     */
    function serialize(location) {
      return `${location.row},${location.col}`
    }

    const visited = {}
    const queue = []

    if (room.getTemplate().isPassable()) {
      for (let row = room_location.row; row < room_location.row + room.getHeight(); ++row) {
        for (let col = room_location.col; col < room_location.col + room.getWidth(); ++col) {
          const start = { row: row, col: col }
          if (!this.isOutOfBounds(start)) {
            queue.push(start)
            visited[serialize(start)] = {
              distance: 1,
              camefrom: null
            }
          }
        }
      }
    } else {
      const start = room.getEntranceLocation(room_location)
      if (!this.isOutOfBounds(start)) {
        queue.push(start)
        visited[serialize(start)] = {
          distance: 1,
          camefrom: null
        }
      }
    }

    // done via BFS, but a bit complicated because need to trace the path

    while (queue.length) {
      const location = queue.shift()
      const tile = this.getTile(location)
      const extra_rooms = []
      const current_room = tile.getRoomInstance()
      if (current_room) {
        extra_rooms.push(current_room)
      }
      for (const neighbor of tile.entranceOfRooms().concat(extra_rooms)) {
        if (neighbor != room && !(neighbor.key in nearby_room_keys)) {
          // compute the path
          const path = []
          let current = location
          while (current) {
            path.push(current)
            current = visited[serialize(current)].camefrom
          }

          path.reverse()

          // save the info
          nearby_room_keys[neighbor.key] = path
        }
      }

      const distance = visited[serialize(location)].distance

      if (!is_for_path && distance >= nearby_limit) continue

      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      const new_locations = []
      for (const mod of directions) {
        new_locations.push({
          row: location.row + mod[0],
          col: location.col + mod[1],
        })
      }

      // handle portal travel
      if (!is_for_path) {
        if (current_room && current_room.getTemplate().isPortal()) {
          const active_portals = []
          for (const portal_key of setup.RoomTemplate.PORTAL_ROOM_TEMPLATE_KEYS) {
            active_portals.push(...State.variables.roomlist.getRoomInstances(
              { template: setup.roomtemplate[portal_key] }
            ))
          }
          for (const portal of active_portals.filter(portal => portal.isPlaced())) {
            new_locations.push(portal.getLocation())
          }
        }
      }

      // randomize movement order to get a semi-random shortest path
      if (!is_for_path) {
        setup.rng.shuffleArray(new_locations)
      }

      for (const new_location of new_locations) {
        if (this.isOutOfBounds(new_location)) continue
        if (serialize(new_location) in visited) continue
        const tile = this.getTile(new_location)
        if (!tile.isPassable()) continue
        if (
          !room.getTemplate().isPassable() &&
          new_location.row >= room_location.row &&
          new_location.col >= room_location.col &&
          new_location.col < room_location.col + room.getWidth() &&
          new_location.row < room_location.row + room.getHeight()
        ) continue
        visited[serialize(new_location)] = {
          distance: distance + 1,
          camefrom: location,
        }
        queue.push(new_location)
      }
    }

    return nearby_room_keys
  }

  /**
   * @param {setup.RoomInstance} room
   * @param {TileLocation} room_location
   * @returns {{
   *   rooms: setup.RoomInstance[],
   *   paths: setup.Tile[],
   *   skill_bonuses: number[],
   *   skill_to_room: Array<setup.RoomInstance[]>,
   * }}G
   */
  getAffectingRooms(room, room_location) {
    const skill_bonuses = Array(setup.skill.length).fill(0)
    const bonus_from = skill_bonuses.map(x => [])

    const fortgrid = State.variables.fortgrid
    const skill_bonus_mods = room.getTemplate().getSkillBonus()

    /**
     * @type {Object<number, boolean>}
     */
    let adjacent_room_keys
    if (skill_bonus_mods.filter(bonus => bonus.type == 'adjacent').length) {
      adjacent_room_keys = this._getAdjacentRoomKeys(room, room_location)
    }

    /**
     * @type {Object<number, TileLocation[]>}
     */
    let nearby_room_keys
    if (
      skill_bonus_mods.filter(bonus => bonus.type == 'near').length
    ) {
      nearby_room_keys = this._getNearbyRooms(room, room_location)
    } else {
      nearby_room_keys = {}
    }

    // use the above to compute the nearby rooms
    const used_adj_keys = {}
    const used_near_keys = {}

    for (const adj_bonus of skill_bonus_mods) {
      const skill = setup.skill[adj_bonus.skill_key]
      const bonus = adj_bonus.bonus

      if (adj_bonus.type == 'always') {
        skill_bonuses[skill.key] += bonus
        continue
      }

      const room_template = setup.roomtemplate[adj_bonus.room_template_key]
      if (!room_template) throw new Error(`Missing room template for ${room.getName()} vicinity bonus!`)

      let container
      if (adj_bonus.type == 'adjacent') {
        container = adjacent_room_keys
      } else {
        container = nearby_room_keys
      }

      for (const room_key of Object.keys(container)) {
        const neighbor = State.variables.roominstance[room_key]
        if (neighbor.getTemplate() == room_template) {
          skill_bonuses[skill.key] += bonus
          bonus_from[skill.key].push(neighbor)
          if (adj_bonus.type == 'adjacent') {
            used_adj_keys[neighbor.key] = true
          } else {
            used_near_keys[neighbor.key] = true
          }
        }
      }
    }

    // combine the rooms and tiles, then make unique
    const room_keys = [
      ...new Set(Object.keys(used_adj_keys).concat(Object.keys(used_near_keys)))
    ]

    const used_paths = []
    for (const key of Object.keys(used_near_keys)) {
      used_paths.push(nearby_room_keys[key].map(location => this.getTile(location)))
    }

    const tiles = [
      ...new Set([].concat.apply([], used_paths))
    ]

    return {
      rooms: room_keys.map(key => State.variables.roominstance[key]),
      paths: tiles,
      skill_bonuses: skill_bonuses,
      skill_to_room: bonus_from,
    }
  }

  /**
   * @param {setup.RoomInstance} room 
   * @param {boolean} [is_return_obsolete_tiles]
   * @return {TileLocation[] | boolean | null}
   */
  placeAnywhere(room, is_return_obsolete_tiles) {
    const rotations = [0, 1, 2, 3]
    setup.rng.shuffleArray(rotations)
    const rows = [0]
    for (let i = -1; i >= -this.getIndoorHeight(); --i) {
      rows.push(i)
    }
    for (let i = 1; i <= this.getOutdoorHeight(); ++i) {
      rows.push(i)
    }
    for (let row of rows) {
      for (let col = 0; col < this.getWidth(); ++col) {
        for (let rotation of rotations) {
          // @ts-ignore
          room.setRotation(rotation)
          if (!this.checkRoomCanRelocateTo(room, { row: row, col: col }, /* skip pathing = */ false)) {
            setup.notify(`${room.rep()} has been auto-placed`)
            const res = this.relocateRoom(room, { row: row, col: col }, is_return_obsolete_tiles)
            if (is_return_obsolete_tiles) {
              return res
            } else {
              return true
            }
          }
        }
      }
    }
    setup.notify(`No valid room placement found. Try expanding your fort.`)
    return null
  }

  cachePaths() {
    // cache old paths so we know which ones would need to be redrawn
    const result = []
    for (let row = -this.getIndoorHeight() + 1; row <= this.getOutdoorHeight(); row += 1) {
      const row_ele = []
      for (let col = 0; col < this.getWidth(); ++col) {
        const tile = this.getTile({ row: row, col: col })
        if (!tile.isPath()) {
          row_ele.push(-1)
        } else {
          const dirs = tile.getPathDirectionId()
          row_ele.push(dirs[0] + dirs[1] * 5 + dirs[2] * 25 + dirs[3] * 125)
        }
      }
      result.push(row_ele)
    }
    return result
  }

  recomputePaths() {
    if (this.is_paths_computed) return
    this.is_paths_computed = true

    const room = State.variables.roomlist.getRoomInstances({
      template: setup.roomtemplate.roadindoor
    })[0]
    const all_rooms = this._getNearbyRooms(
      room,
      room.getLocation(),
      /* is for path = */ true
    )

    const tiles = this.getTiles()
    for (const tile_row of tiles) {
      for (const tile of tile_row) {
        tile.removePath()
      }
    }

    for (const locations of Object.values(all_rooms)) {
      for (const location of locations) {
        const tile = this.getTile(location)
        if (tile.isPath()) continue
        if (!tile.isPassable()) continue
        tile.setPath()
      }
    }
  }
}
