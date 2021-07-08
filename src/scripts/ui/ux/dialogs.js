

setup.Dialogs = {}

/**
 * @typedef {object} OpenDialogArgs
 * @property {string} OpenDialogArgs.title
 * @property {string} [OpenDialogArgs.classnames]
 * @property {string} [OpenDialogArgs.passage]
 * @property {string|Node} [OpenDialogArgs.content]
 * 
 * @param {OpenDialogArgs} options 
 */
setup.Dialogs.open = function ({ title, classnames, passage, content }) {
  if (Dialog.isOpen()) {
    // dialog is already open
    alert('There is already an open dialog')
    return
  }
  return new Promise((resolve, reject) => {
    Dialog.setup(title, classnames)

    if (content instanceof Node) {
      // @ts-ignore
      Dialog.append(content)
    } else {
      const dialog_content = passage ? Story.get(passage).processText() : setup.DevToolHelper.stripNewLine(content || '')
      Dialog.wiki(dialog_content)
    }

    Dialog.open({} /*, () => {
      // this callback does not work. if dialog closed via Dialog.close(), it's not called....
    }*/)
    $(document).one(':dialogclosing', (ev) => {
      resolve()
    })
  })
}

/**
 * @param {setup.Unit} unit 
 */
setup.Dialogs.openUnitImage = function (unit) {
  const image_object = setup.UnitImage.getImageObject(unit.getImage())
  if (image_object) {
    return setup.Dialogs.openImage(
      setup.UnitImage.getImageObject(unit.getImage()),
      image_object.info.title || 'Unknown Title',
    )
  }
}

/**
 * @param {ImageObject} image_object
 * @param {string} title
 */
setup.Dialogs.openImage = function (image_object, title) {
  return setup.Dialogs.open({
    title: title,
    classnames: "dialog-unitimage",
    content: html`
      <figure>
        ${setup.repImg({ imagepath: image_object.path, extra_class: 'content-image' })}
        <figcaption>
          ${setup.DOM.Util.Image.credits(image_object.info)}
        </figcaption>
      </figure>
    `,
  })
}

