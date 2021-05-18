#!/bin/bash

output=/dev/stdout

debug=$1
twee=$2

if [ "$debug" = "debugfast" ] || [ "$debug" = "debug" ]; then
  file="dist/index.html"
  generateddir="generated/dev"
else
  echo "[PRECOMPILED / DEPLOY] Sanity checks..." > $output

  sh sanityCheck.sh

  nodejs dev/checkImageMetas.js --strict --check
  nodejs dev/checkImageMetas.js --strict --check dist/imagepacks/CCSubmission
  nodejs dev/checkImageMetas.js --strict --check --room
  nodejs dev/checkImageMetas.js --strict --check --content

  if [ "$debug" = "precompiled" ]; then
    file="dist/precompiled.html"
  else
    file="dist/index.html"
  fi

  generateddir="generated/dist"
fi

if [ "$debug" = "deployitch" ]; then
  cp dev/itch_io.twee project/twee
else
  rm project/twee/itch_io.twee
fi

if ! [ "$debug" = "sanity" ]; then

  if [ "$twee" = "twee" ]; then
    echo "Skipping webpack..." > $output
  elif [ "$debug" = "debug" ]; then
    echo "Running webpack on FULL debug mode..." > $output
    webpack --env debug --env development
  elif [ "$debug" = "debugfast" ]; then
    echo "Running webpack on FAST debug mode..." > $output
    webpack --env debug
  elif [ "$debug" = "deployitch" ]; then
    echo "Running webpack on ITCH mode..." > $output
    webpack --env itch
  else
    echo "Running webpack on DEPLOY mode..." > $output
    webpack
  fi

	export TWEEGO_PATH=dev/tweeGo/storyformats
	[ -z "$TWEEGO_EXE" ] && TWEEGO_EXE="tweego"

	if hash $TWEEGO_EXE 2>/dev/null; then
		echo "system tweego binary"
	else
		case "$(uname -m)" in
			x86_64 | amd64)
				echo "x64 arch"
				if [ "$(uname -s)" = "Darwin" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_osx64"
				elif [ "$OSTYPE" = "msys" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_win64"
				else
					TWEEGO_EXE="./dev/tweeGo/tweego_nix64"
				fi
				;;
			x86 | i[3-6]86)
				echo "x86 arch"
				if [ "$(uname -s)" = "Darwin" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_osx86"
				elif [ "$OSTYPE" = "msys" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_win86"
				else
					TWEEGO_EXE="./dev/tweeGo/tweego_nix86"
				fi
				;;
			*)
				echo "No system tweego binary found, and no precompiled binary for your platform available."
				echo "Please compile tweego and put the executable in PATH."
				exit 2
				;;
		esac
	fi

  echo "Running tweego..." > $output
  $TWEEGO_EXE -f $npm_package_config_format -m src/modules/ --head=src/head-content.html -o $file project $generateddir

  if [ "$debug" = "deploy" ] || [ "$debug" = "deployfull" ] || [ "$debug" = "deployitch" ]; then

    echo "[DEPLOY] Making deployment directory..." > $output
    rm -r deploy/
    cp -r dist deploy
    rm deploy/precompiled.html

    if [ "$debug" = "deployitch" ]; then
      echo "[ITCH.IO] merging imagemeta.js"
      rm -r deploy/imagepacks/default
      cp -r ../itchunit deploy/imagepacks/default
      nodejs dev/checkImageMetas.js --strict --check --merge --flatten deploy/imagepacks/default
      nodejs dev/checkImageMetas.js --strict --check --merge --room deploy/img/room
    fi

    echo "[DEPLOY] Removing unused images..." > $output
    rm -r deploy/img/equipmentslot/big
    rm -r deploy/img/furnitureslot/big
    rm -r deploy/img/itemclass/big
    rm -r deploy/img/job/big
    rm -r deploy/img/role/big
    rm -r deploy/img/trait/big
    rm -r deploy/img/special/big

    zipfile='focfull.zip'

    if [ "$debug" = "deployitch" ]; then
      echo "[ITCH.IO] Replacing unit image pack..." > $output

      rm -r deploy/img/customunit/

      rm -r deploy/img/duty
      rm -r deploy/img/equipment
      rm -r deploy/img/equipmentslot
      rm -r deploy/img/furnitureslot
      rm -r deploy/img/itemclass

      rm -r deploy/img/job
      rm -r deploy/img/other

      rm -r deploy/img/panorama/big

      rm -r deploy/img/role
      rm -rf deploy/img/room/*/
      rm -r deploy/img/room/*.svg
      rm -r deploy/img/room/*.png

      rm -r deploy/img/sexbodypart
      rm -r deploy/img/sexpose
      rm -r deploy/img/sexposition

      rm -r deploy/img/special

      rm -r deploy/img/tag_building
      rm -r deploy/img/tag_duty
      rm -r deploy/img/tag_lore
      rm -r deploy/img/tag_quest
      rm -r deploy/img/tag_room
      rm -r deploy/img/tag_sexaction
      rm -r deploy/img/tag_trait
      rm -r deploy/img/tag_unitaction

      rm -r deploy/img/trait

      mv deploy/imagepacks/default deploy
      rm -r deploy/imagepacks/
      mkdir deploy/imagepacks
      mv deploy/default deploy/imagepacks
      rm -r deploy/install.txt

      echo "[ITCH.IO] Cleanup unit images folder..."
      # remove all the subdirectories (leave only imagepack.js and the flattened images)
      find deploy/imagepacks/default -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
      rm generated/dist/scripts/images.min.js

      zipfile='focitch.zip'
    fi

    echo "[DEPLOY] Zipping..." > $output
    zip -q -r $zipfile deploy

    echo "[DEPLOY] Cleanup..." > $output
    rm -r deploy/
    rm project/twee/itch_io.twee
  fi

fi

