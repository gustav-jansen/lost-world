const SMALL_DOMAINS = [
  domain("insects", "Insects", "Crawling hunger, tiny strength, swarms, and omens underfoot.", "#a7c957", "Summon Beetles", "Ant Strength", "Crawling Omen", "Locust Cloud", "animals", "combat", "monsterFear", "damageMonster"),
  domain("birds", "Birds", "Flocks, warnings, clever eyes, songs, and migration.", "#90cdf4", "Call Flock", "Raven Wit", "Dawn Chorus", "Great Migration", "monsterFear", "faith", "fear", "animals"),
  domain("livestock", "Livestock", "Herds, milk, wool, patient strength, and sacrifice.", "#e9c46a", "Call Goats", "Bull Strength", "Milk Plenty", "Sacred Herd", "animals", "combat", "food", "animals"),
  domain("trees", "Trees", "Roots, shelter, bark, shade, and old endurance.", "#6ab04c", "Raise Saplings", "Barkskin", "Root Shelter", "Ancient Grove", "forest", "combat", "defense", "forest"),
  domain("fruit", "Fruit", "Ripening, sweetness, vitality, and harvest.", "#f0bc54", "Grow Fruit", "Bless Vitality", "Sweet Scent", "Great Harvest", "food", "heal", "faith", "food"),
  domain("sea", "Sea", "Tides, salt, fish, mist, and cleansing depths.", "#4ea8de", "Salt Mist", "Tide Vitality", "Fish Wash Ashore", "Great Tide", "cleanse", "heal", "food", "cleanse"),
  domain("night", "Night", "Dark shelter, owls, secrets, and hidden roads.", "#5b5f97", "Deepen Shadows", "Owl Sight", "Starless Dream", "Long Night", "hide", "faith", "fear", "hide"),
  domain("rot", "Rot", "Decay turned against decay, fungus, ruin, and renewal.", "#8e44ad", "Controlled Rot", "Mold Flesh", "Spoil Omen", "Black Compost", "damageMonster", "cleanse", "monsterFear", "food"),
  domain("ash", "Ash", "After-fire, gray warnings, choking dust, and renewal.", "#9a8c98", "Ash Veil", "Soot Skin", "Choking Sign", "Ashfall", "hide", "combat", "monsterFear", "damageMonster"),
  domain("fire", "Fire", "Heat, courage, burning circles, and bright terror.", "#f95738", "Kindle Flame", "Ember Blood", "Fire Dance", "Wildfire Sign", "damageMonster", "combat", "faith", "damageMonster"),
  domain("wind", "Wind", "Gusts, whispers, speed, scent, and moving weather.", "#bde0fe", "Guiding Gust", "Fleet Breath", "Whispering Air", "Tempest", "monsterFear", "hide", "faith", "damageMonster"),
  domain("stone", "Stone", "Endurance, cairns, cliffs, walls, and heavy blows.", "#adb5bd", "Raise Cairn", "Stone Bones", "Wall Omen", "Living Hill", "defense", "combat", "faith", "defense"),
  domain("fish", "Fish", "Streams, scales, plenty, slick escape, and river luck.", "#48cae4", "Call Shoal", "Scale Luck", "River Sign", "Silver Run", "food", "hide", "faith", "food"),
  domain("art", "Art", "Song, carving, memory, beauty, and shared meaning.", "#ffafcc", "Inspire Song", "Maker's Hand", "Painted Omen", "Masterwork", "faith", "faith", "fear", "faith"),
  domain("hiding", "Hiding", "Concealment, burrows, masks, and unseen paths.", "#606c38", "Hide Camp", "Soft Step", "False Trail", "Vanishing Place", "hide", "hide", "monsterFear", "hide"),
  domain("rain", "Rain", "Water from above, mud, growth, mercy, and storms.", "#74c0fc", "Soft Rain", "Rain-Washed Body", "Thunder Murmur", "Storm Season", "food", "cleanse", "monsterFear", "food"),
  domain("dreams", "Dreams", "Sleep, prophecy, strange courage, and inward roads.", "#c77dff", "Send Dream", "Clear Sleep", "Shared Vision", "Prophetic Night", "faith", "heal", "fear", "faith"),
  domain("blood", "Blood", "Life, kinship, wounds, frenzy, and sacrifice.", "#c1121f", "Blood Sign", "Hot Blood", "Kin Oath", "Red Vow", "faith", "combat", "fear", "combat"),
  domain("bone", "Bone", "Ancestors, hard frames, relics, and grave warnings.", "#f1faee", "Ancestor Bones", "Hard Frame", "Skull Omen", "Bone Circle", "faith", "combat", "monsterFear", "defense"),
  domain("moss", "Moss", "Soft cover, damp healing, quiet growth, and patience.", "#80b918", "Moss Bed", "Green Poultice", "Quiet Cover", "Living Carpet", "food", "heal", "hide", "cleanse"),
  domain("flowers", "Flowers", "Scent, color, bees, courtship, and fragile hope.", "#f72585", "Bloom Patch", "Petal Grace", "Sweet Omen", "Endless Spring", "food", "faith", "fear", "faith"),
  domain("reeds", "Reeds", "Wetland shelter, baskets, whispers, and hidden water.", "#84a98c", "Raise Reeds", "Reed Step", "Whisper Bed", "Marsh Maze", "hide", "hide", "faith", "defense"),
  domain("clay", "Clay", "Mud, shaping hands, vessels, shelter, and bodies remade.", "#bc6c25", "Shape Clay", "Clay Flesh", "Kiln Sign", "First Vessel", "defense", "heal", "faith", "defense"),
  domain("salt", "Salt", "Preservation, sting, sea memory, and clean wounds.", "#e0fbfc", "Salt Circle", "Clean Wound", "Bitter Omen", "White Plain", "cleanse", "heal", "monsterFear", "cleanse"),
  domain("smoke", "Smoke", "Signals, choking veils, memory, and escape.", "#adb5bd", "Smoke Veil", "Smoke Breath", "Signal Fire", "Sky Darkened", "hide", "hide", "faith", "monsterFear"),
  domain("stars", "Stars", "Navigation, fate, cold light, and distant witnesses.", "#ffd6ff", "Star Sign", "Far Sight", "Named Constellation", "Falling Star", "faith", "faith", "fear", "damageMonster"),
  domain("teeth", "Teeth", "Bites, trophies, warning grins, and predator courage.", "#fefae0", "Tooth Charm", "Sharp Jaw", "Predator Sign", "Great Maw", "monsterFear", "combat", "faith", "damageMonster"),
  domain("shells", "Shells", "Armor, shore gifts, echoes, and spiral shelter.", "#f4d35e", "Shell Gift", "Shell Skin", "Spiral Omen", "Great Carapace", "defense", "combat", "faith", "defense"),
  domain("honey", "Honey", "Sweetness, bees, binding, healing, and treasured food.", "#ffb703", "Honeycomb", "Sweet Blood", "Bee Murmur", "Golden Hive", "food", "heal", "faith", "animals"),
  domain("echoes", "Echoes", "Repeated voices, warnings, caves, and remembered vows.", "#b8c0ff", "Echo Warning", "Remembered Voice", "Cave Omen", "Many Voices", "monsterFear", "faith", "fear", "faith"),
  domain("frost", "Frost", "Cold bite, stillness, preservation, and glittering fear.", "#caf0f8", "Frost Rime", "Cold Blood", "Ice Sign", "Deep Freeze", "monsterFear", "combat", "hide", "damageMonster"),
  domain("paths", "Paths", "Trails, crossings, return, migration, and safe ways.", "#dda15e", "Open Path", "Sure Feet", "Trail Omen", "Sacred Road", "paths", "hide", "faith", "paths"),
];

function domain(id, name, description, color, areaLabel, blessingLabel, influenceLabel, greatLabel, areaEffect, blessingEffect, influenceEffect, greatEffect) {
  return {
    id,
    name,
    description,
    color,
    miracles: {
      area: { label: areaLabel, effect: areaEffect, explanation: miracleExplanation(areaEffect, areaLabel, name, "area") },
      blessing: { label: blessingLabel, effect: blessingEffect, explanation: miracleExplanation(blessingEffect, blessingLabel, name, "blessing") },
      influence: { label: influenceLabel, effect: influenceEffect, explanation: miracleExplanation(influenceEffect, influenceLabel, name, "influence") },
      great: { label: greatLabel, effect: greatEffect, explanation: miracleExplanation(greatEffect, greatLabel, name, "great") },
    },
    blessings: blessingsFor(id, name, blessingLabel, blessingEffect),
  };
}

function miracleExplanation(effect, label, domainName, mode) {
  const scale = mode === "great" ? "a powerful" : mode === "area" ? "a targeted" : "a subtle";
  const explanations = {
    food: `${label} creates edible ${domainName.toLowerCase()}-touched abundance near the target so people can forage instead of starve.`,
    animals: `${label} calls living creatures into the world, giving the tribe prey, sacrifice, and signs of ${domainName.toLowerCase()} favor.`,
    forest: `${label} raises sheltering growth that provides cover, forage, and a visible sign of ${domainName.toLowerCase()} power.`,
    heal: `${label} restores a chosen person and makes their body more resistant to hunger, rot, and fear.`,
    combat: `${label} strengthens a chosen person for hunting, defense, and fighting monsters.`,
    faith: `${label} gives people a story they can repeat, raising faith through wonder and shared meaning.`,
    fear: `${label} calms fear and steadies people against panic, monsters, and bad omens.`,
    monsterFear: `${label} frightens nearby monsters and can force them to flee from the tribe.`,
    cleanse: `${label} washes rot from soil and souls with ${domainName.toLowerCase()} power.`,
    hide: `${label} conceals people from hungry eyes and makes the tribe harder for threats to read.`,
    damageMonster: `${label} wounds the nearest monster with ${scale} expression of ${domainName.toLowerCase()} power.`,
    defense: `${label} fortifies people and territory, making the tribe harder to break.`,
    paths: `${label} opens safe path terrain, helping people travel, return home, and spread faith without creating food.`,
  };
  return explanations[effect] || `${label} expresses the ${domainName} domain in a practical way.`;
}

function blessingsFor(domainId, domainName, blessingLabel, primaryEffect) {
  const templates = {
    combat: ["strength", "willpower", "defense"],
    heal: ["healing", "willpower", "forage"],
    faith: ["intelligence", "faithSpread", "willpower"],
    hide: ["stealth", "speed", "intelligence"],
    cleanse: ["healing", "willpower", "defense"],
    defense: ["defense", "strength", "willpower"],
    food: ["forage", "healing", "intelligence"],
    animals: ["strength", "forage", "faithSpread"],
    forest: ["defense", "forage", "healing"],
    paths: ["speed", "forage", "faithSpread"],
    monsterFear: ["willpower", "defense", "faithSpread"],
    fear: ["willpower", "faithSpread", "healing"],
    damageMonster: ["strength", "willpower", "defense"],
  };
  const effects = templates[primaryEffect] || ["strength", "intelligence", "willpower"];
  return effects.map((effect, index) => blessing(domainId, domainName, blessingLabel, effect, index));
}

function blessing(domainId, domainName, blessingLabel, effect, index) {
  const names = {
    strength: `${domainName} Strength`,
    intelligence: `${domainName} Insight`,
    willpower: `${domainName} Resolve`,
    healing: `${domainName} Mending`,
    speed: `${domainName} Step`,
    forage: `${domainName} Forager`,
    faithSpread: `${domainName} Voice`,
    stealth: `${domainName} Veil`,
    defense: `${domainName} Ward`,
  };
  const explanations = {
    strength: `Permanent blessing. Increases strength, improving hunting, combat, and monster defense.`,
    intelligence: `Permanent blessing. Increases intelligence, improving food choices and faith spread.`,
    willpower: `Permanent blessing. Increases willpower, improving resistance to fear and rot.`,
    healing: `Permanent blessing. Grants steady recovery and better resistance to sickness and rot.`,
    speed: `Permanent blessing. Helps the person move safely, return home, and avoid danger.`,
    forage: `Permanent blessing. Helps the person find edible plants and animals before starvation becomes dangerous.`,
    faithSpread: `Permanent blessing. Makes the person better at telling convincing stories about your domain.`,
    stealth: `Permanent blessing. Makes the person harder for monsters and the fiend to notice.`,
    defense: `Permanent blessing. Improves tribe defense and courage when threats attack.`,
  };
  return {
    id: `${domainId}-${effect}`,
    label: index === 0 ? blessingLabel : names[effect],
    effect,
    explanation: explanations[effect],
  };
}

globalThis.SMALL_DOMAINS = SMALL_DOMAINS;
