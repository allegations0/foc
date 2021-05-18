function refreshGoto() {
  setup.UnitImage.initializeImageTable().then(() => setup.DOM.Nav.goto())
}

/**
 * @returns {setup.DOM.Node}
 */
setup.DOM.Menu.imagepacks = function () {
  const fragments = []

  fragments.push(html`
    <h2>Image Packs</h2>

    <p><b>Note:</b> image pack settings are shared by all saves</p>
  `)

  /* enter new image pack */
  {
    const inner = []
    inner.push(setup.DOM.Util.message(
      `(add new image pack)`,
      html`
        <div class='helpcard'>
        <p>
          Enter the image pack name or url
          ${setup.DOM.Util.help(
        html`
              <p>
              If the image pack is not a URL, then put the image pack in the
              "imagepack" directory. For example, you it should look like "imagepack/myimagepack".
              Then put "myimagepack" here.
              As an example, try putting "example" below to load the example imagepack,
              which should be located at "imagepack/example" by default.
              </p>

              <p>
              If it's a URL, then just put the entire URL.
              </p>

              <p>
                <a target="_blank" href="https://gitgud.io/darkofocdarko/foc/-/blob/master/docs/images.md#creating-your-own-image-pack">
                  How to create a new image pack
                </a>
              </p>
            `
      )}
          </p>
          <p>
          ${setup.DOM.Util.twine(`<<textbox '_newimagepack' "">>`)}
          </p>
          <p>
            ${setup.DOM.Nav.button(
        `Add`,
        () => {
          let trimmed = State.temporary.newimagepack?.trim()
          if (trimmed) {
            if (!setup.isAbsoluteUrl(trimmed)) {
              trimmed = `${setup.UnitImage.IMAGEPACK_DIR_NAME}/${trimmed}`
            }
            setup.globalsettings.imagepacks = [
              ...(setup.globalsettings.imagepacks || []), trimmed
            ]
          }
          refreshGoto()
        },
      )}
          </p>

        </div>
      `
    ))

    if (setup.FileUtil.supportsDirectoryPicker()) {
      inner.push(html`&nbsp;`)
      inner.push(setup.DOM.Nav.link(
        `(auto-install packs in game folder)`,
        () => {
          setup.FileUtil.autodetectImagePacks().then(
            () => setup.DOM.Nav.goto()
          )
        }
      ))
    }
    fragments.push(setup.DOM.create('div', {}, inner))
  }

  function imagePackAction(imagepack, active) {
    return () => {
      if (active) {
        setup.globalsettings.imagepacks = (setup.globalsettings.imagepacks || []).filter(a => a !== imagepack)
      } else {
        setup.globalsettings.imagepacks = (setup.globalsettings.imagepacks || []).concat([imagepack])
      }
      refreshGoto()
    }
  }

  const current = setup.globalsettings.imagepacks || []
  const all = current.concat(setup.UnitImage.DEFAULT_IMAGE_PACKS_SHOWN.filter(image => !current.includes(image)))

  if (all.length) {
    fragments.push(html`
      <p>
        <small>
          Note that the list below only shows active image packs and
          image packs that comes shipped with the game. If you have a custom image pack
          and it is ${setup.DOM.Text.danger('disabled')}, it will not be shown below.
          You have to manually add it using "(add new image pack)" above.
        </small>
      </p>
    `)
  }

  for (const imagepack of all) {
    const active = current.includes(imagepack)
    const meta = setup.UnitImage.getImagePackMetadata(imagepack)
    const inner = []
    inner.push(html`
      <div style="float: right">
        ${setup.DOM.Nav.link(
      active ? '(remove)' : '(re-add)',
      imagePackAction(imagepack, active)
    )}
      </div>
      <div>
          ${meta ?
        html`<b>${meta.title || 'Unnamed pack'}</b> by <i>${meta.author || 'unknown'}</i> (${meta.numimages} images)`
        :
        html`
              ${setup.DOM.Text.dangerlite('Unable to load image pack')}
            `
      }
      ${active ? setup.DOM.Text.successlite('[Enabled]') : setup.DOM.Text.dangerlite('[Disabled]')}
      </div>
      <div>
          <small>
            Location: 
            <span style="color: darkkhaki">
              ${imagepack}
            </span>
          </small>
      </div>
      ${meta ? html`<p>${meta.description || ''}</p>` : ''}
    `)
    let classes
    if (current.includes(imagepack)) {
      classes = 'card activeimagepackcard'
    } else {
      classes = 'card inactiveimagepackcard'
    }
    fragments.push(setup.DOM.create('div', { class: classes }, inner))
  }

  if (!current.length) {
    fragments.push(html`
      <p>
        <small>No packs installed</small>
      </p>
    `)
  }

  return setup.DOM.create('div', {}, fragments)
}
