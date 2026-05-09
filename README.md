# Little God Prototype

A browser game prototype about being a weak fruit-domain god watching over a stone-age tribe while a Rot Fiend competes for worship.

## How To Play

Open `index.html` in a web browser.

You start with a few faith points. Spend them on miracles:

- `Grow Fruit`: creates food near the tribe and impresses nearby people.
- `Bless Vitality`: select a person first, then heal and strengthen them.
- `Sweet Scent`: makes people seek fruit and slightly increases belief.
- `Great Harvest`: divinity 2 miracle that creates a large amount of fruit.
- `Cleanse Rot`: divinity 2 miracle that removes corruption from people and land.
- `Drive Beast Away`: divinity 2 miracle that removes one wild monster.
- `Lightning Fiend`: divinity 2 miracle that costs 50 faith and kills the Rot Fiend.

The tribe acts on its own every few seconds. People get hungry, search for food, eat, rest, pray, sacrifice animals, and may become followers after witnessing enough helpful miracles.

## Creature Bars

- `Hunger`: red. High is bad. Starving people lose health and faith.
- `Health`: green. If it reaches 0, the person dies.
- `Faith`: gold. High faith can make the person follow you.
- `Rot`: purple. High rot can make the person follow the Rot Fiend.

## Threats

- Animals wander the map and can be sacrificed by your followers for faith.
- Wild monsters hunt animals and people.
- People can defend themselves against monsters, especially when tribe members are nearby.
- Random events can cause drought, sickness, beast attacks, rot blooms, or bad omens.
- The Rot Fiend spoils fruit, spreads rot, steals followers, blesses cultists, and eats creatures.
- People can form tribes when enough gather together. Tribes keep members close, can grow, and influence the fiend.
- Neutral and player tribes deter the fiend based on tribe size. Fiend tribes attract it, but the fiend rarely eats its own tribe.
- Tribes have a defense value based on members and species. Strong defenses can wound, kill, or drive away monsters.
- Starting people spawn in several loose clusters instead of one central blob, so multiple tribes can emerge.

## Targeted Miracles

Click any map tile to set the miracle target. Area miracles such as `Grow Fruit`, `Great Harvest`, `Cleanse Rot`, and some event answers are centered on that target. Clicking a person selects them and also sets the target to their tile.

Once your held faith reaches 25, divinity rises to level 2 permanently and stronger miracles unlock. You can spend the faith afterward without losing divinity 2.

## Difficulty Settings

Balance values live in `settings.js` instead of being hidden in the game code. You can also click `Settings` in the browser, edit the values, and apply them to restart the simulation. Browser edits are saved locally.

## Goal

Win by gaining the configured follower target or killing the Rot Fiend.

Lose if everyone dies or the Rot Fiend gains the configured cult target.

## Prototype Notes

This is intentionally small. The purpose is to test whether the core loop feels interesting:

- Simulated people have needs and simple personalities.
- The player influences the world indirectly through miracles.
- Worship generates more faith, which enables more miracles.
- The fiend adds pressure by corrupting people and damaging the food supply.

Good next additions would be more god domains, multiple fiends, dreams, prophecies, relationships, and multiple tribes.
