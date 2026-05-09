# Little God Prototype

A browser game prototype about being a weak small-domain god watching over a stone-age tribe while a rival fiend competes for worship.

## How To Play

Open `index.html` in a web browser.

At the start of each match, 32 face-down domain cards appear. Pick one card to reveal your god's domain, then begin the match. The fiend receives its own random domain silently.

Your domain miracle and blessing buttons are renamed by your chosen domain, with readable explanations for what each power does. Spend faith on miracles:

- Area miracle: targets the selected map tile.
- Blessing miracle: often affects the selected person, though some domains use wider effects.
- Influence miracle: changes belief, fear, hiding, animals, or threats.
- Great miracle: divinity 2 domain miracle with a stronger effect.
- `Cleanse Rot`: divinity 2 miracle that removes corruption from people and land.
- `Drive Beast Away`: divinity 2 miracle that removes one wild monster.
- `Lightning Fiend`: divinity 2 miracle that costs 50 faith and kills the fiend.

The tribe acts on its own every few seconds. People get hungry, forage, hunt animals, rest, pray, talk about gods, and may become followers after witnessing enough helpful miracles.

## Creature Bars

- `Hunger`: red. High is bad. Starving people lose health and faith.
- `Health`: green. If it reaches 0, the person dies.
- `Faith`: gold. High faith can make the person follow you.
- `Rot`: purple. High rot can make the person follow the fiend.

## Threats

- Animals wander the map and can be sacrificed by your followers for faith.
- Hungry people can hunt and eat animals. They can also forage from fruit, berries, mushrooms, reeds, flowers, forests, and grassland.
- Wild monsters hunt animals and people.
- People can defend themselves against monsters, especially when tribe members are nearby.
- Random events can cause drought, sickness, beast attacks, rot blooms, or bad omens.
- The fiend spoils fruit, spreads rot, steals followers, blesses cultists, and eats creatures.
- People can form tribes when enough gather together. Tribes keep members close, can grow, and influence the fiend.
- Neutral and player tribes deter the fiend based on tribe size. Fiend tribes attract it, but the fiend rarely eats its own tribe.
- Tribes have a defense value based on members and species. Strong defenses can wound, kill, or drive away monsters.
- Starting people spawn in several loose clusters on a larger map, so multiple fixed-home tribes can emerge.

## Targeted Miracles

Click any map tile to set the miracle target. Area miracles, great miracles, `Cleanse Rot`, and some event answers are centered on that target. Clicking a person selects them and also sets the target to their tile.

## Blessings And Priests

Miracles affect the world. Blessings are permanent upgrades for selected people. Each domain has three explained blessings, such as strength, insight, resolve, stealth, foraging, healing, defense, or faith-spreading gifts.

People have stats:

- `Strength`: improves hunting, combat, and defense.
- `Intelligence`: improves social influence and practical choices.
- `Willpower`: resists fear, rot, and spiritual pressure.

You can designate one living follower as your priest for free. A priest receives a domain-flavored ongoing blessing and spreads faith more strongly, but if they die you lose faith.

Followers can spread faith by talking to nearby people, especially within their tribe. Fiend cultists can spread rot in the same way.

## Map Shapes

People and creatures use different silhouettes instead of all being circles. Species, animals, monsters, priests, tribe homes, and the fiend have distinct shapes so the map is easier to read at a glance.

## Domains

Current small domains are: Insects, Birds, Livestock, Trees, Fruit, Sea, Night, Rot, Ash, Fire, Wind, Stone, Fish, Art, Hiding, Rain, Dreams, Blood, Bone, Moss, Flowers, Reeds, Clay, Salt, Smoke, Stars, Teeth, Shells, Honey, Echoes, Frost, and Paths.

Once your held faith reaches 25, divinity rises to level 2 permanently and stronger miracles unlock. You can spend the faith afterward without losing divinity 2.

## Difficulty Settings

Balance values live in `settings.js` instead of being hidden in the game code. You can also click `Settings` in the browser, edit the values, and apply them to restart the simulation. Browser edits are saved locally.

## Goal

Win by gaining the configured follower target or killing the fiend.

Lose if everyone dies or the fiend gains the configured cult target.

## Prototype Notes

This is intentionally small. The purpose is to test whether the core loop feels interesting:

- Simulated people have needs, simple personalities, smoother movement, and social influence.
- The player influences the world indirectly through miracles.
- Worship generates more faith, which enables more miracles.
- The fiend adds pressure by corrupting people and damaging the food supply.

Good next additions would be more god domains, multiple fiends, dreams, prophecies, relationships, and multiple tribes.
