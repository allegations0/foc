## Game version

v1.2.3.4

## Steps to reproduce

1. Start game
2. ...

## What went wrong?

Game crashed with error

```
index.html:151308 Error: <<set>>: bad evaluation: Unit player duplicated
	<<set $unit.player = new setup.Unit(     ["PlayerName", "PlayerLastName"],     [setup.trait.gender_male, setup.trait.subrace_humankingdom, setup.trait.bg_mercenary, setup.trait.dick_medium, setup.trait.balls_medium, setup.trait.anus_tight],     Array(setup.skill.length).fill(12),     'player'     )>>
```

## What should have happened?

It shouldn't crash.

## Any other information that might be useful?

It's probably caused by [this line](https://gitgud.io/darkofocdarko/fort-of-chains/-/blob/master/project/twee/story.twee#L159).
