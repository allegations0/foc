## Compiling Javascript Files

The following installation guide is adapted from
[ChapelR](https://github.com/ChapelR/tweego-setup).
You'll need
[NodeJS](docs/installing-node.md) installed.
Click the links to find my step-by-step instructions (with pictures) on how to do this on Windows systems.
You will need to combine my instructions with a bit of Googling to get these working on other OSes. 

After getting all that squared away, clone or download this repo.
Open a command prompt and navigate to the repo's root directory (where the `package.json` file is),
run `npm install`, either from the terminal (linux) or from the command prompt (windows).
This will take a few minutes.
Once that's done:

- Windows: execute `build.bat`, and once it finished, open `dist/index.html`

- Linux: run `npm run build`, and your browser should automatically open the compiled file at the end.
