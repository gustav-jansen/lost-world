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
- `Faith`: gold. At 50+, the person follows you if rot is not stronger.
- `Rot`: purple. At 50+, the person can become a follower of the Rot Fiend.

## Threats

- Animals wander the map and can be sacrificed by your followers for faith.
- Wild monsters hunt animals and people.
- Random events can cause drought, sickness, beast attacks, rot blooms, or bad omens.
- The Rot Fiend spoils fruit, spreads rot, steals followers, blesses cultists, and eats creatures.

At 25 stored faith, your divinity rises to level 2 and stronger miracles unlock.

## Goal

Win by gaining 10 followers or killing the Rot Fiend.

Lose if everyone dies or the Rot Fiend gains 8 followers.

## Prototype Notes

This is intentionally small. The purpose is to test whether the core loop feels interesting:

- Simulated people have needs and simple personalities.
- The player influences the world indirectly through miracles.
- Worship generates more faith, which enables more miracles.
- The fiend adds pressure by corrupting people and damaging the food supply.

Good next additions would be more god domains, multiple fiends, dreams, prophecies, relationships, and multiple tribes.
