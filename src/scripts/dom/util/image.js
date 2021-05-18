setup.DOM.Util.Image = {}

/**
 * @typedef {{
 * image_name: string,
 * tooltip?: string,
 * image_class?: string,
 * extra_styles?: string,
 * }} ImageLoadArgs
 * 
 * @param {ImageLoadArgs} args
 * @returns {setup.DOM.Node}
 */
setup.DOM.Util.Image.load = function ({ image_name, tooltip, image_class, extra_styles }) {
  const imageurl = (window.IMAGES && window.IMAGES[image_name]) || image_name
  const onerror = "if (!(this.src.endsWith('png'))) this.src = this.src.slice(0, -3) + 'png';"

  const img_params = {
    src: imageurl,
    onerror: onerror,
  }
  if (image_class) {
    img_params['class'] = image_class
  }
  if (extra_styles) {
    img_params['style'] = extra_styles
  }
  const base = setup.DOM.create('img', img_params)

  const params = {}
  if (tooltip) {
    return setup.DOM.create('span', { 'data-tooltip': tooltip }, base)
  } else {
    // Don't wrap this with span, due to CSS shenanigan in unit description page.
    return base
  }
}

/**
 * 
 * @param {setup.DOM.Node} image 
 * @returns {setup.DOM.Node}
 */
setup.DOM.Util.Image.flipHorizontal = function (image) {
  return html`
  <span class='flip-horizontal'>
    ${image}
  </span>
  `
}

/**
 * 
 * @param {Object | setup.Unit} image_object
 */
setup.DOM.Util.Image.credits = function (image_object) {
  let credits
  if (image_object.artist) {
    credits = image_object
  } else if (image_object && typeof image_object === 'object' && 'getImageInfo' in image_object) {
    credits = image_object.getImageInfo()
  } else {
    return null
  }

  if (credits) {
    return html`
      <span class='artistinfo'>
        "${credits.title}" by ${credits.artist}
        ${credits.url ? setup.DOM.Nav.linkExternal(`(source)`, credits.url) : ``}
        (${credits.license})
        ${credits.extra ? `[${credits.extra}]` : ``}
      </span>
    `
  } else {
    return null
  }
}


/**
 * @param {string} image_name
 * @returns {setup.DOM.Node}
 */
setup.DOM.Util.Image.contentimage = function (image_name) {
  if (State.variables.settings.hidecontentimages) {
    return null
  }

  const image_object = setup.ContentImage.getImageObjectIfAny(image_name)
  if (!image_object) {
    if (State.variables.gDebug) {
      throw new Error(`Missing content image: ${image_name}`)
    }
    return null
  }

  return html`
    <figure class='content-image-figure'>
      ${setup.DOM.Util.onEvent(
    'click',
    setup.repImg({ imagepath: image_object.path, extra_class: 'content-image' }),
    () => {
      setup.Dialogs.openImage(
        image_object,
        image_object.info.title,
      )
    }
  )}
      <figcaption>
        ${setup.DOM.Util.Image.credits(image_object.info)}
      </figcaption>
    </figure>
  `
}

/**
 * 
 * @param {setup.DOM.Node} image 
 * @returns {setup.DOM.Node}
 */
setup.DOM.Util.Image.flipHorizontal = function (image) {
  return html`
  <span class='flip-horizontal'>
    ${image}
  </span>
  `
}

/**
 * 
 * @param {Object | setup.Unit} image_object
 */
setup.DOM.Util.Image.credits = function (image_object) {
  let credits
  if (image_object.artist) {
    credits = image_object
  } else if (image_object && typeof image_object === 'object' && 'getImageInfo' in image_object) {
    credits = image_object.getImageInfo()
  } else {
    return null
  }

  if (credits) {
    return html`
      <span class='artistinfo'>
        "${credits.title}" by ${credits.artist}
        ${credits.url ? setup.DOM.Nav.linkExternal(`(source)`, credits.url) : ``}
        (${credits.license})
        ${credits.extra ? `[${credits.extra}]` : ``}
      </span>
    `
  } else {
    return null
  }
}

