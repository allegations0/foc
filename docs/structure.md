# Twine and SugarCube Basics

## Entry point

Twine is a language very similar to HTML.
The key difference is the concept of `passage`. A passage is basically a URL.
You can move from passage to passage by clicking a link that leads to a different `passage`
(i.e., akin to clicking a link in URL), or by being redirected there.

The first passage the game opens is [this one](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/project/twee/story.twee): the passage named `Start`.
That passage `includes` another passage named `Init`, which is directly below it.
Scrolling to the bottom, you will see:

```
<<focmove "New Game" "ProloguePlayerGen">>
```

This creates a link titled `New Game` that will take the player to the `ProloguePlayerGen` passage.

More information about SugarCube 2 syntax is in its [official docs](https://www.motoslave.net/sugarcube/2/).
For a list of important passages, see [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/docs/structure.md#gui).

## Navigation caveats

In normal SugarCube 2 games, passages is the main way to move between menus.
Whenever you click on a link, the game will usually move to a different passage.
For a game of this complexity, this becomes a performance bottleneck, and this game implements
some caveats to address this.

First, Fort of Chains does not actually move passages when you click on links.
Instead, fort of chains will replace the content of an existing DOM element with an entirely new one.
For example, clicking the "Slavers" menu from the "Quest" menu will instead replace the `div`
containing the quests with the list of slavers.

To do this, the game do away with the standard navigation macros in SugarCube2 (e.g., `<<goto>>`, `<<link>>`, etc.)
Instead, the game uses [custom navigation macros](#navigation).

# Repository Structure

The game tries to follow a rough separation of logic and data.
Data and display are generally located in SugarCube files (.twee), while logic
is in javascript files (.js).

## Coding Style

**Document as much as you can with JSDocs!**

- PascalCase for classes `setup.BuildingInstance`

- camelCase for methods `unit.getTraits()`

- snake_case for properties and variable names `unit.first_name` (don't access this directly! use `unit.getName()`)

- lowercasenospace for data `setup.buildingtemplate.veteranhall`

### Editor Recommendation

You are of course free to use whatever editor you like. If you are unsure what editor to use,
Visual Studio Code works fairly well for this project.

## DOM-Ification

A lot of the UI are now written in the javascript file.
You will often encounter the following snippet
within the twine files:

```
<<set _dom = setup.DOM.Card.unit(_unit)>>
<<attach _dom>>
```

The javascript function `setup.DOM.Card.unit()` will return a DOM object, which is then
attached to the passage via the `attach` macro. This way, the UI code is actually moved into the
`setup.DOM.Card.unit` function, which is in javascript.

## Code / Logic / Javascript Files

All javascript code are located in 
[here](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/src/scripts).
Css codes are in [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/src/styles).
NPM / Yarn will compile them into [here for javascript files](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/project/scripts)
and [here for css files](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/project/styles).

The load order of the javascript files is alphabetical. It is still good practice to use imports instead,
but some legacy code relies on this load order to function.

The javascript source code directory is structured roughly as follows.
All the in-game classes (such as Company,
Trait, Skill, Unit, etc)
are located in the `src/scripts/classes` folder, which forms the bulk of the code.
Text things (such as procedural banters) are in `src/scripts/text`.
Unit names are in `src/scripts/names`.
Other miscelanious stuffs are in `src/scripts/util`, except for Twine macros,
which is in `src/scripts/macro`.
External libraries are in `src/scripts/lib`.
The special file `src/scripts/constants.js` contain all the in-game constants that can
be modified to adjust game balance.
Finally, UI is in `src/scripts/dom` folder.

### Navigation

For optimization purpose, the game does not use twine's native navigation system
(e.g., `[[Hi|Passage]]`). Instead, the game uses these five commands to replace them:

```
- `<<focmove 'Click me!' 'Passage'>>`: replaces `[[Click me!|Passage]]`
- `<<focreturn 'Done!'>>`: replaces `<<return 'Done!'>>`
- `<<focgoto 'PassageName'>>`: replaces `<<goto 'PassageName'>>`
- `<<focgoto>>`: Refresh current page
- `<<foclink 'a' 'b'>><<run console.log('Hi')>><</foclink>>`: Replaces `<<link 'a' 'b'>>`
```

Exception is in Content Creator, where you should use twine default navigation system because
the performance leeway is higher. In the javascript, their counterpart can be found in
`setup.DOM.Nav`. For example, `setup.DOM.Nav.link` would replace `<<foclink>>`.

**Don't use twine navigation in the game**

### Class Modularity

The game tries to follow feature modularity. This means that a new feature should be self-contained
in its own class. For example, if you want to add a tattoo system, then you should not modify
the `Unit` class. Instead, create a `setup.Tattoo` class, which can do things like
`$tattoo.getTattoo(unit)` and `$tattoo.setTattoo(unit, tattoo)`.

All objects must inherit from `TwineClass`. This is because of
[SugarCube](https://www.motoslave.net/sugarcube/2/docs/#guide-tips-non-generic-object-types)
restriction on using objects.

## How the Objects are Stored and Saved by the Game

SugarCube maintains basically three locations for your variables.

First, the `setup` namespace is a global namespace for objects that does not
change over the playthrough.
For example,
For example, quest templates are in
`setup.questtemplate`, while traits are in `setup.trait`.

Second, the `State.variables` namespace store variables that can change over the course
of a gameplay, and will be saved into the save file. `State.variables` should only contain
those variables, since `State.variables` will be directly encoded into JSON whenever the player
saves the game.
For example, list of units are in
`State.variables.unit`, while list of ongoing quest instances are in
`State.variables.questinstance`.
In the Twine files (`.twee`), these variables can be referred with a shorthand:
`$unit` will refer to `State.variables.unit`.

Finally, the `State.temporary` stores "temporary" variables that can change over the game,
but will not be saved, and will also be lost at the end of each week.
Generally, only use these for temporary variables, e.g., a loop iterator.
In the Twine files (`.twee`), these variables can be referred with a shorthand:
`_unit` will refer to `State.temporary.unit`.

## Data and GUI Files

Most data are located in the [twine files](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/project/twee).
There are several exceptions of data that are located in the javascript files.
The first exception are duties, because they tend to have a unique effect.
The second exception are some banter texts, because they have too many
variables to take into account.

## UI javascript functions

Many of the UI are written in javascript, which is attached into the twine via this snippet:

```
<<set _dom = setup.DOM.Card.unit(_unit)>>
<<attach _dom>>
```

What this means is that we set the variable `_dom` to be the document fragment returned
by the `setup.DOM.Card.quest` function.
The functions that generate document fragment are all located under the `setup.DOM` namespace,
and can be found [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/src/scripts/dom).
For example, `setup.DOM.Card.quest` is found [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/src/scripts/dom/card/quest.js).

For ease of writing these functions, we have several helper methods [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/src/scripts/dom/AAA_domutils.js).
The most important function there is the `html` template tag, e.g.:

```
const fragment = html`
  <div>
    Hello!
  </div>
  <div>
    You gain ${setup.DOM.Util.money(1000)}.
  </div>
`
```

The `html` template tag will take care all of these and turn it into a proper document fragment.

The second most important helper function is the `setup.DOM.create` function, which you can find
[here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/src/scripts/dom/AAA_domutils.js).
For example,

```
  const fragment = setup.DOM.create('div', {class: 'abc'}, [setup.DOM.Util.money(1000), html`<div>Hello!</div>`])
```

is the same as

```
  const fragment = html`
    <div class='abc'>${setup.DOM.Util.money(1000)}${html`<div>Hello!</div>`}</div>
  `
```

See [dom writing guidelines](#dom-writing-guidelines) for more information.

## Important Files

Some important files:
- Entry point is [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/project/twee/story.twee)
- Backwards compatibility is handled [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/src/scripts/util/backwardscompat.js)
- Sidebar menu is [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/project/twee/meta/menu.twee)
- Initialization code is [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/project/twee/initvars). Also includes definitions of skills, traits, item classes, etc.
- Passage transition code is [here](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/src/scripts/macro/navigation.js)

## Dom Writing Guidelines

This is a guideline on how to write the DOM-generating code in javascript.

All dom-related code should be located in [this directory](https://gitgud.io/darkofocdarko/fort-of-chains/-/tree/master/src/scripts/dom).

- The `dom/card` directory is for showing cards, e.g., unit card, quest card, etc. From twine, you will usually
just call a card, and then attach it. [Example for quest](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/project/twee/widget/quest.twee#L9).
- The `dom/menu` directory is for showing menus, such as unit detail menu.
- `dom/util` directory is for all util functions that returns a Document Fragment object.
- `dom/helper` directory is for all util functions that does NOT return a Document Fragment object.
- `dom/nav` directory is special: for storing the equivalent functions to the navigation macros
in twine: that is, `goto`, `link`, `button`, and the `[[a|b]]` syntax.

These can be accessed via the `setup.DOM` singleton. For example, those in `dom/card` are accessed in `setup.DOM.Card`, while
those in `dom/util` are accessed in `setup.DOM.Util`.

# Looking for something to do?

Check out the [list of issues](https://gitgud.io/darkofocdarko/fort-of-chains/-/issues)! If it is unassigned, it is
up for grabs!
