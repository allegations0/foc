@echo off
:: Fort of Chains Basic Compiler - Windows. Adapted from free cities.

:: By default compiles with the script/styles bundles from /generated/dist
:: Run with 'debug' arg to use the ones from /generated/dev

:: Set working directory
pushd %~dp0

if "%1"=="debug" (
	SET GENERATEDDIR=generated/dev
) else (
	SET GENERATEDDIR=generated/dist
)

:: Run the appropriate compiler for the user's CPU architecture.
if %PROCESSOR_ARCHITECTURE% == AMD64 (
	CALL "%~dp0dev\tweeGo\tweego_win64.exe" -m "%~dp0src/modules" -o "%~dp0dist/index.html" --head src/head-content.html "%~dp0project" "%~dp0%GENERATEDDIR%"
) else (
	CALL "%~dp0dev\tweeGo\tweego_win86.exe" -m "%~dp0src/modules" -o "%~dp0dist/index.html" --head src/head-content.html "%~dp0project" "%~dp0%GENERATEDDIR%"
)

popd
ECHO Done
