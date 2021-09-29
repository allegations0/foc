# Development Guide

This guide details deployment process for the game.
The deployment process consist of several steps:

- Increase version number
- Build the precompiled version
- Optionally, build the zip version to upload on itch.io

These three steps are detailed as follows:

## Increasing version number

- The first step depends on your OS:
  - Windows:
    - Execute `update.bat` to bump micro version (e.g., 1.8.2.3 to 1.8.2.4)
    - Execute `updatepatch.bat` to bump patch version (e.g., 1.8.2.3 to 1.8.3.0)
    - Execute `updateminor.bat` to bump minor version (e.g., 1.8.2.3 to 1.9.0.0)
    - Execute `updatemajor.bat` to bump major version (e.g., 1.8.2.3 to 2.0.0.0)
  - Linux:
    - Run `npm run set-version bump` to bump micro version (e.g., 1.8.2.3 to 1.8.2.4)
    - Run `npm run set-version bump-patch` to bump patch version (e.g., 1.8.2.3 to 1.8.3.0)
    - Run `npm run set-version bump-minor` to bump minor version (e.g., 1.8.2.3 to 1.9.0.0)
    - Run `npm run set-version bump-major` to bump major version (e.g., 1.8.2.3 to 2.0.0.0)

- The command above will automatically update `changelog.txt` (https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/changelog.txt), and you need to update this file.

## Building the precompiled version

- Windows:
  - Execute `precompile.bat`
- Linux:
  - Run: `npm run precompile`

This will automatically update the `dist` folder with the latest precompiled version.

## Building the full zip version

Please note this may take a while.

- Windows:
  - Execute `deploy.bat`
- Linux:
  - Run: `npm run deployfull`

This will generate a `focfull.zip` containing the full game.
