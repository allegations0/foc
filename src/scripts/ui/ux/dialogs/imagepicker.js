
const modes = [
  { text: 'Use image from packs', value: 'packs' },
  { text: 'Use custom image', value: 'custom' },
]

const filter_states = [
  { text: 'Enabled', value: false },
  { text: 'Disabled', value: true },
  { text: 'All', value: null },
]

/** @param {setup.Unit} unit */
setup.Dialogs.openUnitImagePicker = function (unit) {

  const all_images = State.variables.unitimage.getImages(unit, true)
  let visited_images = {}

  let custom_image_path = unit.custom_image_name

  let current_mode = custom_image_path ? 'custom' : 'packs' // current mode

  /** @type {string|null} */
  let selimage = (unit && State.variables.unitimage.getImagePath(unit)) || null

  let filter_state = false
  //let filter_string = unit_identity.replace(/\|/g, ' ').replace(/_/g, ':')

  function refreshPreview() {
    setup.DOM.refresh('.dialog-imagepicker figure')
  }

  function refreshIgnoreButton() {
    setup.DOM.refresh('.dialog-imagepicker-ignorebtn')
  }

  function refreshThumbnails(container) {
    container = container || document.querySelector('.dialog-imagepicker .thumbnails')
    if (!container)
      return

    //const filter_strings = filter_string.trim().split(/\s+/).map(s => s.toLowerCase().replace(/:/g, '_'))
    //if (!filter_strings[0])
    //filter_strings.length = 0

    for (const elem of container.children) {
      if (!(elem instanceof HTMLElement))
        continue

      const path = elem.getAttribute("data-url")
      const is_disabled = State.variables.unitimage.isImageIgnored(path)

      let should_be_visible = true

      if (filter_state !== null && is_disabled !== filter_state)
        should_be_visible = false

      //if (filter_strings.length) {
      //  for (let str of filter_strings) {
      //    if (!path.includes(str)) {
      //      should_be_visible = false
      //      break
      //    }
      //  }
      //}

      const style_display = should_be_visible ? 'block' : 'none'
      if (elem.style.display !== style_display)
        elem.style.display = style_display

      const has_disabled = elem.classList.contains("disabled")
      if (has_disabled !== is_disabled)
        elem.classList.toggle("disabled")

      const has_selected = elem.classList.contains("selected")
      if (has_selected !== (selimage === path))
        elem.classList.toggle("selected")
    }
  }

  function refreshFilters() {
    setup.DOM.refresh('.dialog-imagepicker-filters')
    refreshThumbnails()
  }

  function setMode(newMode) {
    current_mode = newMode

    setup.DOM.refresh('.dialog-imagepicker-modes')
    refreshIgnoreButton()
    refreshPreview()
    refreshFilters()

    const container = document.querySelector(".dialog-imagepicker-container")
    if (container) {
      for (const mode of modes) {
        if (mode.value !== current_mode)
          container.classList.remove('mode-' + mode.value)
      }
      container.classList.add('mode-' + current_mode)
    }
  }

  /** @param {string} value */
  function setCustomImagePath(value) {
    if (custom_image_path !== value) {
      custom_image_path = value
      refreshPreview()
      refreshThumbnails()
    }
  }

  /** @param {string} imgpath */
  function setSelected(imgpath) {
    selimage = imgpath
    refreshThumbnails()
    refreshPreview()
    refreshIgnoreButton()
  }

  /**
   * @param {string} url 
   * @returns {string}
   */
  function getImageFallbacks(url) {
    const png_fallback = url.slice(0, -3) + 'png'
    return `url('${setup.escapeHtml(url)}'), url('${setup.escapeHtml(png_fallback)}')`
  }

  // Note: use CSS background-image instead of <img>, because when hidden,
  // background-image is not loaded until shown, whereas for img it is
  // And with hundreds of images, this does matter

  const content = html`
    <div class="dialog-imagepicker-container mode-${current_mode}">

      <header style="display: flex">
        ${setup.DOM.createRefreshable("span", { class: "dialog-imagepicker-filters" }, () => {
    if (current_mode !== "packs")
      return null

    const counts = new Array(filter_states.length).fill(0)
    counts[2] += all_images.length
    for (const image_object of all_images) {
      const state = State.variables.unitimage.isImageIgnored(image_object.path)
      counts[state ? 1 : 0] += 1
    }

    return [
      html`Show: &nbsp;`,
      ...filter_states.map(({ text, value }, i) =>
        setup.DOM.create('button', {
          class: filter_state === value ? "selected" : "",
          click() {
            filter_state = value
            refreshFilters()
          },
        }, text + ' (' + counts[i] + ')')
      )
    ]
  })}
        
        <!--Filter:
        {setup.DOM.create('input', {
          type: 'text',
          value: filter_string,
          input(ev) {
            filter_string = ev.target.value
            refreshThumbnails()
          }
        })}-->

        <div style="flex-grow: 1"></div>

        Source: &nbsp;

        ${setup.DOM.createRefreshable("span", { class: "dialog-imagepicker-modes" }, () =>
    modes.map(({ text, value }) =>
      setup.DOM.create('button', {
        class: current_mode === value ? "selected" : "",
        click() { setMode(value) },
      }, text)
    )
  )}
      </header>

      <div class="thumbnails">
        ${all_images.map(image_object => {
    const url = setup.escapeHtml(image_object.path)
    return setup.DOM.create("div", {
      style: {
        'background-image': getImageFallbacks(url),
        display: 'none',
      },
      'data-url': url,
      click(ev) {
        setSelected(image_object.path)
      }
    })
  })}
      </div>

      <div class="custom">
        <p>
          Put your image in the
          <span class="successtext">dist/img/customunit</span> folder.
          Then, enter the filename in the text box following this.
          For example, if you put in
          <span class="successtextlite">dist/img/customunit/girl.png</span> file,
          then enter in the following <span class="successtextlite">girl.png</span>.
        </p>

        <p>
          Alternatively, you can also drag and drop the image to this dialog, or directly to the unit interact screen.
          However, the image <span class="dangertext">must</span> be located in the
          <span class="successtextlite">dist/img/customunit</span>
          folder.
        </p>

        ${setup.DOM.create('input', {
    type: 'text',
    value: custom_image_path,
    style: 'width: 100%; box-sizing: border-box',
    input(ev) {
      if (current_mode !== "custom")
        setMode("custom")
      setCustomImagePath(ev.target.value)
    }
  })}
      </div>
      
      <aside class="dialog-imagepicker-preview">
        ${setup.DOM.createRefreshable('figure', {}, () => {
    if (!selimage)
      return null

    const is_custom = current_mode === "custom"

    let url = selimage
    if (is_custom)
      url = setup.isAbsoluteUrl(custom_image_path) ? custom_image_path : 'img/customunit/' + custom_image_path

    url = setup.escapeHtml(url)

    let image_object
    if (!is_custom)
      image_object = setup.UnitImage.getImageObject(selimage)

    return html`
            <div style="background-image: ${getImageFallbacks(url)}"></div>
            <figcaption>
              ${!is_custom && image_object && image_object.info && setup.DOM.Util.Image.credits(image_object.info)}
              ${State.variables.gDebug ? '<div class="graytext">' + url + '</div>' : ''}
            </figcaption>
          `
  })}

        <footer class="dialog-buttons">
          ${setup.DOM.createRefreshable("div", {
    class: "dialog-imagepicker-ignorebtn",
  }, () => {
    if (!selimage || current_mode !== "packs")
      return null

    return setup.DOM.create('button', {
      click() {
        State.variables.unitimage.setImageIgnored(selimage, !State.variables.unitimage.isImageIgnored(selimage))
        refreshFilters()
        setup.DOM.refresh(".dialog-imagepicker-ignorebtn")
      }
    }, 'Elegible in generation: ' + (State.variables.unitimage.isImageIgnored(selimage) ? 'no' : 'yes'))
  })}

          <div style="flex-grow: 1"></div>
          
          ${setup.DOM.create('button', {
    click() {
      const eligible_images = all_images.filter(x => !State.variables.unitimage.isImageIgnored(x.path))
      if (!eligible_images.length)
        return

      let unvisited_images = eligible_images.filter(x => !visited_images[x.path])
      if (!unvisited_images.length) {
        visited_images = {}
        unvisited_images = eligible_images
      }

      const image_path = setup.rng.choice(unvisited_images).path
      visited_images[image_path] = true
      setSelected(image_path)
    }
  }, 'Randomize')}

          &nbsp;

          ${setup.DOM.create('button', {
    click() {
      if (current_mode === "custom" && custom_image_path) {
        unit.custom_image_name = custom_image_path
      } else {
        unit.custom_image_name = ''
        State.variables.unitimage.setImage(unit, selimage)
      }
      Dialog.close()
    }
  }, 'Ok')}
          ${setup.DOM.create('button', {
    click() {
      Dialog.close()
    }
  }, 'Cancel')}
        </footer>
      </aside>
    </div>
  `;

  refreshThumbnails(content.querySelector('.thumbnails'))

  return setup.Dialogs.open({
    title: "Pick Unit Image",
    classnames: "dialog-imagepicker dialog-fullwidth dialog-fullheight",
    content: content,
  }).then(() => {
    return selimage
  })
}
