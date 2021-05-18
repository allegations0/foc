#!/bin/bash

# Adapted from free cities

output=/dev/stdout

#display an error message
function echoError() {
	echo -e "\033[0;31m$*\033[0m"
}

#display message
function echoMessage() {
	echo "$1" >"${output}"
}

#compile the HTML file
function compile() {
	export TWEEGO_PATH=dev/tweeGo/storyformats
	[ -z "$TWEEGO_EXE" ] && TWEEGO_EXE="tweego"

	if hash $TWEEGO_EXE 2>/dev/null; then
		echoMessage "system tweego binary"
	else
		case "$(uname -m)" in
			x86_64 | amd64)
				echoMessage "x64 arch"
				if [ "$(uname -s)" = "Darwin" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_osx64"
				elif [ "$OSTYPE" = "msys" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_win64"
				else
					TWEEGO_EXE="./dev/tweeGo/tweego_nix64"
				fi
				;;
			x86 | i[3-6]86)
				echoMessage "x86 arch"
				if [ "$(uname -s)" = "Darwin" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_osx86"
				elif [ "$OSTYPE" = "msys" ]; then
					TWEEGO_EXE="./dev/tweeGo/tweego_win86"
				else
					TWEEGO_EXE="./dev/tweeGo/tweego_nix86"
				fi
				;;
			*)
				echoError "No system tweego binary found, and no precompiled binary for your platform available."
				echoError "Please compile tweego and put the executable in PATH."
				exit 2
				;;
		esac
	fi

	file="dist/index.html"

  $TWEEGO_EXE -m src/modules/ --head=src/head-content.html -o $file project/ generated/dist/ || build_failed="true"

	if [ "$build_failed" = "true" ]; then
		echoError "Build failed."
		exit 1
	fi

	echoMessage "Saved to $file."

  xdg-open dist/index.html
}

compile



