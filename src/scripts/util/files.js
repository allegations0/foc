
// Defines functions that deal with local filesystem files

setup.FileUtil = {}

setup.FileUtil.supportsDirectoryPicker = function() {
  return (window.location.protocol === "file:") && ("showDirectoryPicker" in window)
}

// Helper function to avoid using "for await (... of ...)"
// to read a directory entries
function resolveAsyncIterator(iterator) {
  return new Promise((resolve, reject) => {
    let values = []

    function handleNext({ done, value }) {
      if (done) {
        resolve(values)
      } else {
        values.push(value)
        iterator.next().then(handleNext, reject)
      }
    }

    iterator.next().then(handleNext, reject)
  })
}

// list the valid imagepacks in the given folder
function listImagePacks(imagepacksdir) {
  if (!imagepacksdir)
    return Promise.resolve([])
  
  return new Promise((resolve, reject) => {
    resolveAsyncIterator(imagepacksdir.entries()).then(entries => {
      let promises = []
      for (const [name, entry] of entries) {
        if (entry.kind === "directory") {
          promises.push(Promise.allSettled([
            entry.getFileHandle("imagemeta.js"),
            entry.getFileHandle("imagepack.js"),
          ]).then(results => {
            const either_exists = results.some(x => x.status === "fulfilled")
            return either_exists ? name : null
          }))
        }
      }
      Promise.allSettled(promises).then(results => {
        const packpaths = []
        for (const result of results) {
          if (result.status === "fulfilled" && result.value)
            packpaths.push(result.value)
        }
        resolve(packpaths)
      })
    }, () => {
      console.error(`failed to list subfolders of '${setup.UnitImage.IMAGEPACK_DIR_NAME}'`)
      resolve([])
    })
  })
}

// try to detect "imagepacks" folder from user selected folder
function findImagePacksDir(dir) {
  return new Promise((resolve, reject) => {
    if (dir.name === setup.UnitImage.IMAGEPACK_DIR_NAME)
      return resolve(dir) // found "imagepacks", it is dir
    
    // check if we are in "/dist"
    dir.getFileHandle("precompiled.html").then(file => {
      dir.getDirectoryHandle(setup.UnitImage.IMAGEPACK_DIR_NAME).then(subdir => {
        resolve(subdir) // found "imagepacks", it is a subfolder of dir
      }, () => {
        resolve(null) // we're in /dist, but imagepacks folder does not exist, so fail silently
      })
    }, () => {
      // check if user selected the parent folder
      dir.getDirectoryHandle("dist").then(subdir => {
        findImagePacksDir(subdir).then(resolve, reject)
      }, () => {
        resolve(undefined) // failed to find it, report error
      })
    })
  })
}

let imagepacksdir = null

setup.FileUtil.autodetectImagePacks = function() {
  if (!imagepacksdir) { // if not picked during this session, prompt to pick it
    // @ts-ignore
    return window.showDirectoryPicker().then(picked_dir => {
      if (!picked_dir) // Cancelled by user, or failed to open
        return

      return findImagePacksDir(picked_dir).then(detected_dir => {
        imagepacksdir = detected_dir || null

        if (detected_dir === undefined)
          return alert("The selected folder is not the game folder!")
          
        if (imagepacksdir)
          return setup.FileUtil.autodetectImagePacks()
      })
    })
  }

  return listImagePacks(imagepacksdir).then(detectedpacks => {
    const packlist = (setup.globalsettings.imagepacks || [])
      //.filter(x => x && setup.isAbsoluteUrl(x)) // leave entries with absolute path intact

    for (const detectedpack of detectedpacks) {
      if (!packlist.includes(detectedpack))
        packlist.push(detectedpack)
    }

    setup.globalsettings.imagepacks = packlist
  })
}
