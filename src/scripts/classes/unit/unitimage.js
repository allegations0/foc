
// stores information about generating a unit's image.

// Unit image generation is rather complex now. Basically, the game tries to find the
// "least stale" image among the possible images for the unit.

import "../../util/globalsettings" // ensure globalsettings loads before this file
import "../../util/common" // ensure common loads before this file

const IMAGEPACK_DIR_NAME = "imagepacks"

// will be assigned to $unitimage
setup.UnitImage = class UnitImage extends setup.TwineClass {
  constructor() {
    super()

    // mapping from unit.key to their image "identity"

    /**
     * Current used image.
     * unit.key -> image_full_path
     * @type {Record<string, string>}
     */
    this.unit_image_map = {}

    /**
     * image_full_path -> when was it last picked?
     * @type {Record<string, number>}
     */
    this.image_last_used = {}

    /**
     * image_full_path -> true if image should be ignored, because the player say so
     * @type {Record<string, true>}
     */
    this.image_ignored = {}

    // counter for image_last_used
    this.image_use_counter = 1
  }

  /** Name of the folder inside "/dist" containing the image packs */
  static IMAGEPACK_DIR_NAME = IMAGEPACK_DIR_NAME

  // image packs that are always shown by default
  static DEFAULT_IMAGE_PACKS_SHOWN = [
    `${IMAGEPACK_DIR_NAME}/default`,
    `${IMAGEPACK_DIR_NAME}/CCSubmission`,
    `${IMAGEPACK_DIR_NAME}/example`,
  ]

  // default extra image packs
  static DEFAULT_IMAGE_PACKS = [
    `${IMAGEPACK_DIR_NAME}/default`,
    `${IMAGEPACK_DIR_NAME}/CCSubmission`,
  ]

  /**
   * Resets all unit images. Mainly for migrating between different type of unitpacks.
   */
  resetAllImages() {
    this.unit_image_map = {}
    this.image_last_used = {}
    this.image_ignored = {}
    this.image_use_counter = 1
  }

  /** @param {setup.Unit} unit */
  deleteUnit(unit) {
    delete this.unit_image_map[unit.key]
  }

  advanceWeek() {
    this.image_use_counter += setup.UNIT_IMAGE_WEEKEND_MEMORY_LAPSE
  }

  /** @param {setup.Unit} unit */
  getImagePath(unit) {
    if (!(unit.key in this.unit_image_map)) this._updateImage(unit)
    return this.unit_image_map[unit.key]
  }

  /** @param {setup.Unit} unit */
  getImageObject(unit) {
    return setup.UnitImage.getImageObject(this.getImagePath(unit))
  }

  static DEFAULT_IMAGE = Object.freeze({ path: 'img/special/defaultunit.jpg', depth: 0, info: {} })

  /**
   * @param {setup.Unit} unit
   * @param {boolean} [skip_filter]   if true, will not filter out images already in use / banned
   * @returns {ImageObject[]}
   */
  getImages(unit, skip_filter) {
    // get all the still-possible images associated with this unit as a list:
    // [imageobj, ...]

    /**
     * 
     * @param {ImagePackNode} current_table 
     * @returns {ImageObject[]}
     */
    function populate(current_table) {
      /**
       * @type {ImageObject[]}
       */
      const base = [].concat(current_table.images || [])
      for (const trait_key in (current_table.further || {})) {
        if (trait_key in setup.trait && unit.isHasTrait(setup.trait[trait_key])) {
          const next_iter = current_table.further[trait_key]
          const next_images = populate(next_iter)
          base.push(...next_images)
        }
      }
      return base
    }

    // get base table
    const table = this._getDeepestTable(unit)
    let images = populate(table)

    if (!skip_filter) {
      images = images.filter(image_object => !this.image_ignored[image_object.path])
    }

    if (!images.length) {
      images.push(UnitImage.DEFAULT_IMAGE)
    }

    if (skip_filter) {
      // skip the filter phase below
      return images
    }

    // generate images that are already in use, effectively a "banlist"
    const used_image_paths = {}
    for (const unitkey in this.unit_image_map) {
      const image_path = this.unit_image_map[unitkey]
      used_image_paths[image_path] = true
    }

    // filter with the banlist
    const filtered = images.filter(image => !used_image_paths[image.path])
    if (!filtered.length) {
      return images
    } else {
      return filtered
    }
  }

  /**
   * @param {setup.Unit} unit 
   * @param {ImagePackNode} [table]
   * @returns {ImagePackNode | null}
   */
  _getDeepestTable(unit, table) {
    if (!table) table = setup.UnitImage.UNIT_IMAGE_TABLE

    for (const trait_key in table.further) {
      const trait = setup.trait[trait_key]
      if (!unit.isHasTrait(trait)) continue

      const further_table = this._getDeepestTable(unit, table.further[trait.key])
      if (further_table) {
        return further_table
      }
      if (!table.further[trait.key].is_back_allowed) {
        return table.further[trait.key]
      }
    }

    if (table == setup.UnitImage.UNIT_IMAGE_TABLE) {
      return table
    } else {
      return null
    }
  }

  /** @param {ImageObject} image */
  getLastUsed(image) {
    if (!(image.path in this.image_last_used)) return -setup.UNIT_IMAGE_MEMORY
    return this.image_last_used[image.path]
  }

  /** called when unit's trait set is changed
   * @param {setup.Unit} unit
   * @param {boolean} [is_forced]
   */
  resetImage(unit, is_forced) {
    // images not loaded yet due to async computation:
    if (!setup.UnitImage.IMAGES_LOADED) return

    if (!is_forced && (unit.key in this.unit_image_map)) {
      // if current image is still valid, do nothing.
      const possible_images = this.getImages(unit, true)
      const current_image = this.getImageObject(unit)
      if (possible_images.includes(current_image)) {
        return
      }
    }

    if (unit.key in this.unit_image_map) {
      this.image_last_used[this.unit_image_map[unit.key]] = this.image_use_counter
      delete this.unit_image_map[unit.key]
    }
  }

  /**
   * Force set a unit's image to something
   * @param {setup.Unit} unit 
   * @param {ImageObject|string} image 
   */
  setImage(unit, image) {
    this.resetImage(unit, /* is forced = */ true)

    const image_path = typeof image === "string" ? image : image.path
    this.unit_image_map[unit.key] = image_path
    this.image_last_used[image_path] = this.image_use_counter
    this.image_use_counter += 1
  }

  /** @param {setup.Unit} unit */
  getRandomImage(unit) {
    var images = this.getImages(unit)

    setup.rng.shuffleArray(images)

    const image_path_to_idx = {}
    for (var i = 0; i < images.length; ++i) {
      image_path_to_idx[images[i].path] = i
    }

    const unit_image = this
    // return -1 if image1 has lower priority than image2
    function ImageCmp(image1, image2) {
      var last_use1 = unit_image.getLastUsed(image1)
      var last_use2 = unit_image.getLastUsed(image2)

      // first check is via expiration.
      var stale1 = (last_use1 >= unit_image.image_use_counter - setup.UNIT_IMAGE_MEMORY)
      var stale2 = (last_use2 >= unit_image.image_use_counter - setup.UNIT_IMAGE_MEMORY)

      if (stale1 && !stale2) return -1
      if (!stale1 && stale2) return 1

      // next is via depth
      if (image1.depth < image2.depth) return -1
      if (image2.depth < image1.depth) return 1

      // via last use...
      if (last_use1 > last_use2) return -1
      if (last_use1 < last_use2) return 1

      // via index
      if (image_path_to_idx[image1.path] < image_path_to_idx[image2.path]) {
        return -1
      }
      return 1
    }

    images.sort(ImageCmp)
    // console.log(images)

    return images[images.length - 1]
  }

  // called lazily when a unit image needs to be generated
  _updateImage(unit) {
    // console.log(`Generating new identity for unit ${unit.key}`)

    // mark previous image as stale, if any
    if (unit.key in this.unit_image_map) {
      throw new Error(`resetImage() not called before _updateImage for ${unit}`)
    }

    const new_image = this.getRandomImage(unit)

    this.setImage(unit, new_image)
  }

  /** @param {string} image_path */
  isImageIgnored(image_path) {
    return !!this.image_ignored[image_path]
  }

  /**
   * @param {string} image_path
   * @param {boolean} value
   */
  setImageIgnored(image_path, value) {
    if (value)
      this.image_ignored[image_path] = true
    else
      delete this.image_ignored[image_path]
  }


  // warning: this is asynchronous!
  static initializeImageTable(is_initial) {
    /**
     * @param obj {ImagePackNode}
     * @param input {ImagePackNode}
     */
    function mergeTableNode(obj, input) {
      if (!obj.further)
        obj.further = {}

      // is_back_allowed
      if (obj.is_back_allowed === undefined)
        obj.is_back_allowed = true

      if (input.is_back_allowed !== undefined)
        obj.is_back_allowed = obj.is_back_allowed && input.is_back_allowed

      // images
      if (!obj.images)
        obj.images = []

      for (const image_obj of (input.images || [])) {
        const index = obj.images.findIndex(x => x.path === image_obj.path)
        if (index !== -1)
          obj.images[index] = image_obj
        else
          obj.images.push(image_obj)
      }
    }

    /**
     * @param directory {string}
     * @param obj {ImagePackNode}
     * @param packmeta {ImagePackMetadata}
     * @param depth {number}
     * @param {boolean} [is_packmeta_only]
     */
    function Construct(directory, obj, packmeta, depth, is_packmeta_only) {
      return importScripts(directory + 'imagemeta.js').then(function () {
        if (!window.UNITIMAGE_CREDITS) throw new Error(`UNITIMAGE_CREDITS not found in ${directory}`)
        if (!window.UNITIMAGE_LOAD_FURTHER) throw new Error(`UNITIMAGE_LOAD_FURTHER not found in ${directory}`)

        // generate image list
        const image_list = []
        for (const image_key in window.UNITIMAGE_CREDITS) {
          const image_path = `${directory}${image_key}.jpg`
          const image_info = window.UNITIMAGE_CREDITS[image_key]

          // verify info
          // no longer required, since we have a javascript file that checks for this now.
          // user-generated images can have no credits.
          /*
          if (!image_info) throw new Error(`Missing image info for ${image_path}`)
          if (!image_info.title) throw new Error(`Missing title for ${image_path}`)
          if (!image_info.artist) throw new Error(`Missing title for ${image_path}`)
          if (!image_info.url) throw new Error(`Missing title for ${image_path}`)
          if (!image_info.license) throw new Error(`Missing title for ${image_path}`)
          */

          const image_object = {
            path: image_path,
            info: image_info,
            depth: depth,
          }

          if (!is_packmeta_only) {
            setup.UnitImage.UNIT_IMAGES[image_path] = image_object
          }
          image_list.push(image_object)
        }

        packmeta.numimages += image_list.length

        var is_back_allowed = true
        if (window.UNITIMAGE_NOBACK)
          is_back_allowed = false

        const further = window.UNITIMAGE_LOAD_FURTHER

        mergeTableNode(obj, {
          images: image_list,
          is_back_allowed: is_back_allowed,
        })

        if (depth === 1) { // root: fill in the pack metadata, if it exists
          const metadata = window.IMAGEPACK || {}
          packmeta.title = metadata.title
          packmeta.author = metadata.author
          packmeta.description = metadata.description
        }

        // Cleanup
        delete window.UNITIMAGE_CREDITS
        delete window.UNITIMAGE_NOBACK
        delete window.UNITIMAGE_LOAD_FURTHER
        delete window.IMAGEPACK

        let promises = []
        for (const traitkey of further) {
          if (!(traitkey in setup.trait)) {
            throw new Error(`Unrecognized trait key ${traitkey} in directory ${directory}!`)
          }

          const next_dir = `${directory}${traitkey}/`

          if (!obj.further[traitkey])
            obj.further[traitkey] = {}

          // warning: this is asynchronous:
          promises.push(
            Construct(next_dir, obj.further[traitkey], packmeta, depth + 1, is_packmeta_only)
          )
        }

        return Promise.allSettled(promises)
      })
    }

    /**
     * Merge a pack data into UNIT_IMAGE_TABLE, 
     * and prefix the image paths with the pack path
     * @param obj {ImagePackNode}
     * @param data {ImagePackNode}
     * @param packmeta {ImagePackMetadata}
     * @param {boolean} [is_packmeta_only]
     */
    function processImagePack(obj, data, packmeta, is_packmeta_only) {
      for (const image of (data.images || [])) {
        image.path = packmeta.url + "/" + image.path
        setup.UnitImage.UNIT_IMAGES[image.path] = image
      }

      packmeta.numimages += (data.images || []).length

      mergeTableNode(obj, data)

      for (const k of Object.keys(data.further || {})) {
        if (!obj.further[k])
          obj.further[k] = {}
        processImagePack(obj.further[k], data.further[k], packmeta, is_packmeta_only)
      }
    }

    const tryLoadImagePack = (imagepack, is_skip_images) => {
      /** @type {ImagePackMetadata} */
      const packmeta = { url: imagepack, numimages: 0 }

      return new Promise((resolve, reject) => {
        importScripts(imagepack + '/imagepack.js')
          .then(() => { // script found
            const data = window.IMAGEPACK
            delete window.IMAGEPACK

            packmeta.title = data.title
            packmeta.author = data.author
            packmeta.description = data.description

            if (data) {
              processImagePack(is_skip_images ? {} : this.UNIT_IMAGE_TABLE, data, packmeta, is_skip_images)
              resolve()
            } else {
              alert('Detected image pack at "' + imagepack + '", but its "imagepack.js" is invalid')
              reject()
            }
          }, () => { // script not found, try to load the recursive "imagemeta.js" layout
            console.log('If the error: "Failed to load resource: net::ERR_FILE_NOT_FOUND" is shown immediately above this for imagepack.js, it is normal and can be ignored.')
            Construct(imagepack + '/', is_skip_images ? {} : this.UNIT_IMAGE_TABLE, packmeta, /* depth = */ 1, is_skip_images).then(resolve, reject)
          })
      }).then(() => packmeta)
    }

    /** @type {ImagePackNode} */
    this.UNIT_IMAGE_TABLE = {}

    /** @type {Record<string, ImageObject>} */
    this.UNIT_IMAGES = {}

    /** @type {ImagePackMetadata[]} */
    this.LOADED_IMAGEPACKS = []

    /** @type {boolean} */
    this.IMAGES_LOADED = false

    const imagepacks = []

    const current = setup.globalsettings.imagepacks || []

    imagepacks.push(...setup.UnitImage.DEFAULT_IMAGE_PACKS_SHOWN.filter(imagepack => !current.includes(imagepack)))

    for (let custompack of current) {
      if (!custompack)
        continue
      imagepacks.push(custompack)
    }

    // Load each image pack
    return Promise.allSettled(imagepacks.map(imagepack =>
      tryLoadImagePack(imagepack, !current.includes(imagepack)).then(
        (packmeta) => { // success
          console.info(`Loaded image pack "${imagepack}"`)
          this.LOADED_IMAGEPACKS.push(packmeta)
        }, (err) => { // error
          console.warn(`Failed to load image pack "${imagepack}" (${String(err)})`)
          const index = setup.UnitImage.DEFAULT_IMAGE_PACKS_SHOWN.indexOf(imagepack)
          if (index != -1) {
            setup.UnitImage.DEFAULT_IMAGE_PACKS_SHOWN.splice(index, 1)
          }
          const index_all = setup.UnitImage.DEFAULT_IMAGE_PACKS.indexOf(imagepack)
          if (index_all != -1) {
            setup.UnitImage.DEFAULT_IMAGE_PACKS.splice(index_all, 1)
          }
        }
      )
    )).then(() => {
      this.IMAGES_LOADED = true
      if (is_initial) {
        if (!setup.globalsettings.imagepacks) {
          setup.globalsettings.imagepacks = setup.UnitImage.DEFAULT_IMAGE_PACKS
          this.initializeImageTable()
        }
      }
    })

  }

  /** @param {string} imagepack */
  static getImagePackMetadata(imagepack) {
    return this.LOADED_IMAGEPACKS.find(x => x.url === imagepack)
  }

  static getCreditsByArtist() {
    // returns: {artist: [image]}

    /**
     * @param {ImagePackNode} table
     * @param {object} result
     */
    function populateResult(table, result) {
      for (const image of table.images) {
        if (image.info && image.info.artist) {
          if (!(image.info.artist in result)) {
            result[image.info.artist] = []
          }
          result[image.info.artist].push(image)
        }
      }
      for (const further_key in table.further) {
        populateResult(table.further[further_key], result)
      }
    }

    const result = {}
    populateResult(this.UNIT_IMAGE_TABLE, result)
    return result
  }

  /**
   * @param {string} image_path
   * @returns {ImageObject}
   * */
  static getImageObject(image_path) {
    const image_object = this.UNIT_IMAGES[image_path]
    if (!image_object) {
      if (!image_path) {
        // default image
        return setup.UnitImage.DEFAULT_IMAGE
      } else {
        return {
          path: image_path,
          info: {}
        }
      }
    } else {
      return image_object
    }
  }
}

setup.UnitImage.initializeImageTable(true)

