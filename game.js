const canvas = document.querySelector("#world");
const ctx = canvas.getContext("2d");

const ui = {
  faithPoints: document.querySelector("#faithPoints"),
  divinityLevel: document.querySelector("#divinityLevel"),
  followers: document.querySelector("#followers"),
  fiendFollowers: document.querySelector("#fiendFollowers"),
  crisisStatus: document.querySelector("#crisisStatus"),
  peopleList: document.querySelector("#peopleList"),
  selectedPerson: document.querySelector("#selectedPerson"),
  eventLog: document.querySelector("#eventLog"),
  currentEvent: document.querySelector("#currentEvent"),
  answerEvent: document.querySelector("#answerEvent"),
  answerEventCost: document.querySelector("#answerEventCost"),
  settingsToggle: document.querySelector("#settingsToggle"),
  settingsPanel: document.querySelector("#settingsPanel"),
  closeSettings: document.querySelector("#closeSettings"),
  settingsFields: document.querySelector("#settingsFields"),
  applySettings: document.querySelector("#applySettings"),
  resetSettings: document.querySelector("#resetSettings"),
  threats: document.querySelector("#threats"),
  tribesList: document.querySelector("#tribesList"),
  miracleTarget: document.querySelector("#miracleTarget"),
  growFruit: document.querySelector("#growFruit"),
  blessVitality: document.querySelector("#blessVitality"),
  sweetScent: document.querySelector("#sweetScent"),
  greatHarvest: document.querySelector("#greatHarvest"),
  cleanseRot: document.querySelector("#cleanseRot"),
  driveBeast: document.querySelector("#driveBeast"),
  lightningFiend: document.querySelector("#lightningFiend"),
  pauseToggle: document.querySelector("#pauseToggle"),
};

const settingsStorageKey = "little-god-settings";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSettings(base, override) {
  const merged = clone(base);
  if (!override || typeof override !== "object") return merged;
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value) && merged[key]) {
      merged[key] = mergeSettings(merged[key], value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(settingsStorageKey);
    return mergeSettings(DEFAULT_GAME_SETTINGS, saved ? JSON.parse(saved) : null);
  } catch {
    return clone(DEFAULT_GAME_SETTINGS);
  }
}

let settings = loadSettings();

const tileSize = 24;
const cols = Math.floor(canvas.width / tileSize);
const rows = Math.floor(canvas.height / tileSize);
let tickTimer = null;

const terrainColors = {
  grass: "#365d29",
  forest: "#1f4320",
  water: "#254e6f",
  fruit: "#a9a646",
  rot: "#51335f",
};

const speciesColors = {
  Human: "#f3d6a0",
  Elf: "#c3e8b0",
  Lizardfolk: "#93d18b",
  Troll: "#a1a6bd",
  Ogre: "#d0a073",
};

const names = [
  "Aru", "Mira", "Senn", "Tovo", "Ila", "Brak", "Nera", "Oshu", "Venn", "Kala", "Ruk", "Essa",
  "Jora", "Pell", "Hanu", "Tika", "Moro", "Lasa", "Kerr", "Yani", "Dren", "Sula", "Vash", "Orin",
];
const species = ["Human", "Elf", "Lizardfolk", "Troll", "Ogre"];
const personalities = ["cautious", "curious", "bold", "kind", "skeptical", "dreamy", "grim", "generous"];
const animalKinds = ["Deer", "Boar", "Bird"];
const tribeNames = ["Ash Grove", "Stone Rain", "River Tooth", "Amber Root", "Moon Shell", "Thorn Nest"];

const state = {
  faith: settings.startingFaith,
  maxFaithHeld: settings.startingFaith,
  divinity2Unlocked: settings.startingFaith >= settings.divinity2FaithThreshold,
  divinity: 1,
  day: 1,
  paused: false,
  ended: false,
  selectedId: null,
  target: { x: settings.miracles.defaultTargetX, y: settings.miracles.defaultTargetY },
  nextPersonId: 1,
  nextTribeId: 1,
  scentTicks: 0,
  sicknessTicks: 0,
  log: [],
  terrain: [],
  people: [],
  animals: [],
  monsters: [],
  tribes: [],
  event: null,
  fiend: null,
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function livingPeople() {
  return state.people.filter((person) => person.alive);
}

function playerFollowers() {
  return livingPeople().filter((person) => person.allegiance === "player");
}

function fiendFollowers() {
  return livingPeople().filter((person) => person.allegiance === "fiend");
}

function personTribe(person) {
  return state.tribes.find((tribe) => tribe.id === person.tribeId) || null;
}

function tribeMembers(tribe) {
  return livingPeople().filter((person) => person.tribeId === tribe.id);
}

function addLog(text, tone = "") {
  state.log.unshift({ text: `Day ${state.day}: ${text}`, tone });
  state.log = state.log.slice(0, 30);
}

function gainFaith(amount) {
  state.faith += amount;
  checkDivinity();
}

function randomLandPosition() {
  for (let tries = 0; tries < 200; tries += 1) {
    const x = rand(1, cols - 2);
    const y = rand(1, rows - 2);
    if (state.terrain[y]?.[x]?.type !== "water") return { x, y };
  }
  return { x: 10, y: 8 };
}

function targetPosition() {
  return {
    x: clamp(state.target.x, 0, cols - 1),
    y: clamp(state.target.y, 0, rows - 1),
  };
}

function createTerrain() {
  const terrain = [];

  for (let y = 0; y < rows; y += 1) {
    const row = [];
    for (let x = 0; x < cols; x += 1) {
      let tile = "grass";
      if (x > cols - 7 && y > rows - 7) tile = "water";
      if (chance(settings.world.forestChance)) tile = "forest";
      if (chance(settings.world.wildFruitChance)) tile = "fruit";
      row.push({ type: tile, food: tile === "fruit" ? rand(2, 5) : 0, rot: 0 });
    }
    terrain.push(row);
  }

  for (let y = 8; y <= 12; y += 1) {
    for (let x = 11; x <= 15; x += 1) {
      terrain[y][x] = {
        type: chance(settings.world.startingGroveFruitChance) ? "fruit" : "grass",
        food: rand(settings.world.startingFruitFoodMin, settings.world.startingFruitFoodMax),
        rot: 0,
      };
    }
  }

  return terrain;
}

function createPeople() {
  return names.map((name, index) => ({
    id: index + 1,
    name,
    species: species[index % species.length],
    personality: personalities[index % personalities.length],
    x: rand(9, 16),
    y: rand(7, 13),
    hunger: rand(settings.people.startingHungerMin, settings.people.startingHungerMax),
    health: rand(settings.people.startingHealthMin, settings.people.startingHealthMax),
    faith: rand(settings.people.startingFaithMin, settings.people.startingFaithMax),
    rot: rand(settings.people.startingRotMin, settings.people.startingRotMax),
    fear: rand(settings.people.startingFearMin, settings.people.startingFearMax),
    alive: true,
    action: "waking",
    blessed: 0,
    allegiance: "neutral",
    tribeId: null,
  }));
}

function createPersonNear(center, allegiance = "neutral") {
  const id = state.nextPersonId;
  const name = names[id - 1] || `Noma ${id}`;
  const person = {
    id,
    name,
    species: species[(id - 1) % species.length],
    personality: personalities[(id - 1) % personalities.length],
    x: clamp(center.x + rand(-2, 2), 0, cols - 1),
    y: clamp(center.y + rand(-2, 2), 0, rows - 1),
    hunger: rand(settings.people.startingHungerMin, settings.people.startingHungerMax),
    health: rand(settings.people.startingHealthMin, settings.people.startingHealthMax),
    faith: rand(settings.people.startingFaithMin, settings.people.startingFaithMax) + (allegiance === "player" ? 12 : 0),
    rot: rand(settings.people.startingRotMin, settings.people.startingRotMax) + (allegiance === "fiend" ? 12 : 0),
    fear: rand(settings.people.startingFearMin, settings.people.startingFearMax),
    alive: true,
    action: "born into tribe",
    blessed: 0,
    allegiance: "neutral",
    tribeId: null,
  };
  if (state.terrain[person.y][person.x].type === "water") {
    const fallback = randomLandPosition();
    person.x = fallback.x;
    person.y = fallback.y;
  }
  updateAllegiance(person);
  return person;
}

function createAnimals() {
  return Array.from({ length: settings.world.initialAnimals }, (_, index) => {
    const pos = randomLandPosition();
    return {
      id: index + 1,
      kind: animalKinds[index % animalKinds.length],
      x: pos.x,
      y: pos.y,
      alive: true,
    };
  });
}

function createMonsters() {
  return Array.from({ length: settings.world.initialMonsters }, () => spawnMonster());
}

function spawnMonster() {
  const pos = randomLandPosition();
  return {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now() + Math.random()),
    kind: chance(50) ? "Wolf Pack" : "Cave Beast",
    x: pos.x,
    y: pos.y,
    health: settings.monsters.baseHealth,
    fear: 0,
    fleeCooldown: 0,
    alive: true,
  };
}

function createFiend() {
  return {
    x: cols - 8,
    y: rows - 8,
    alive: true,
    faith: settings.fiend.startingFaith,
    cooldown: settings.fiend.startingCooldown,
    eatCooldown: 0,
    domain: "Rot",
  };
}

function init() {
  state.faith = settings.startingFaith;
  state.maxFaithHeld = settings.startingFaith;
  state.divinity2Unlocked = settings.startingFaith >= settings.divinity2FaithThreshold;
  state.divinity = state.divinity2Unlocked ? 2 : 1;
  state.day = 1;
  state.paused = false;
  state.ended = false;
  state.selectedId = null;
  state.target = { x: settings.miracles.defaultTargetX, y: settings.miracles.defaultTargetY };
  state.nextPersonId = names.length + 1;
  state.nextTribeId = 1;
  state.scentTicks = 0;
  state.sicknessTicks = 0;
  state.log = [];
  state.event = null;
  state.tribes = [];
  state.terrain = createTerrain();
  state.people = createPeople();
  state.animals = createAnimals();
  state.monsters = createMonsters();
  state.fiend = createFiend();
  addLog("A fruit spirit wakes over a larger wandering tribe.", "gold");
  addLog("A Rot Fiend crawls from the wet dark and begins whispering.", "bad");
  draw();
  renderUi();
}

function restartGame() {
  if (tickTimer) clearInterval(tickTimer);
  init();
  tickTimer = setInterval(tick, settings.tickMs);
}

function nearestFood(person) {
  let best = null;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tile = state.terrain[y][x];
      if (tile.food <= 0) continue;
      const candidate = { x, y };
      const score = distance(person, candidate);
      if (!best || score < best.score) best = { ...candidate, score };
    }
  }
  return best;
}

function nearestLiving(source, collection) {
  let best = null;
  let bestScore = Infinity;
  for (const entity of collection.filter((item) => item.alive)) {
    const score = distance(source, entity);
    if (score < bestScore) {
      best = entity;
      bestScore = score;
    }
  }
  if (best) best.score = bestScore;
  return best;
}

function peopleNear(center, radius, people = livingPeople()) {
  return people.filter((person) => distance(person, center) <= radius);
}

function countFoodNear(center, radius) {
  let food = 0;
  for (let y = Math.max(0, center.y - radius); y <= Math.min(rows - 1, center.y + radius); y += 1) {
    for (let x = Math.max(0, center.x - radius); x <= Math.min(cols - 1, center.x + radius); x += 1) {
      if (distance(center, { x, y }) <= radius) food += state.terrain[y][x].food;
    }
  }
  return food;
}

function combatSkill(person) {
  const speciesBase = settings.speciesCombat[person.species] || 8;
  const personalityBonus = person.personality === "bold" || person.personality === "grim" ? 3 : person.personality === "cautious" || person.personality === "dreamy" ? -2 : 0;
  const healthBonus = Math.floor(person.health / 25);
  const fearPenalty = Math.floor(person.fear / 25);
  return Math.max(1, speciesBase + personalityBonus + healthBonus - fearPenalty);
}

function tribeDefense(tribe) {
  const members = tribeMembers(tribe);
  return members.reduce((sum, person) => sum + combatSkill(person), 0) + members.length * settings.combat.tribeDefenseBonusPerMember;
}

function updateTribes() {
  for (const tribe of state.tribes) {
    const members = tribeMembers(tribe);
    tribe.memberIds = members.map((person) => person.id);
    if (members.length === 0) continue;
    tribe.x = Math.round(members.reduce((sum, person) => sum + person.x, 0) / members.length);
    tribe.y = Math.round(members.reduce((sum, person) => sum + person.y, 0) / members.length);
    const playerCount = members.filter((person) => person.allegiance === "player").length;
    const fiendCount = members.filter((person) => person.allegiance === "fiend").length;
    tribe.allegiance = playerCount > fiendCount ? "player" : fiendCount > playerCount ? "fiend" : "neutral";
    tribe.spawnCooldown = Math.max(0, tribe.spawnCooldown - 1);
  }

  state.tribes = state.tribes.filter((tribe) => tribe.memberIds.length > 0);

  for (const person of livingPeople()) {
    const tribe = personTribe(person);
    if (tribe && distance(person, tribe) > settings.tribes.returnRadius + 4) person.tribeId = null;
  }

  const untribed = livingPeople().filter((person) => !person.tribeId);
  for (const person of untribed) {
    if (person.tribeId) continue;
    const cluster = peopleNear(person, settings.tribes.formationRadius, untribed).filter((candidate) => !candidate.tribeId);
    if (cluster.length >= settings.tribes.minimumMembers) {
      const id = state.nextTribeId;
      state.nextTribeId += 1;
      const tribe = {
        id,
        name: tribeNames[(id - 1) % tribeNames.length],
        x: Math.round(cluster.reduce((sum, member) => sum + member.x, 0) / cluster.length),
        y: Math.round(cluster.reduce((sum, member) => sum + member.y, 0) / cluster.length),
        allegiance: "neutral",
        memberIds: cluster.map((member) => member.id),
        spawnCooldown: settings.tribes.spawnCooldownDays,
      };
      for (const member of cluster) member.tribeId = id;
      state.tribes.push(tribe);
      addLog(`${tribe.name} forms from ${cluster.length} gathered people.`, "gold");
    }
  }

  for (const tribe of state.tribes) {
    const members = tribeMembers(tribe);
    if (members.length === 0 || members.length >= settings.tribes.maxMembers || tribe.spawnCooldown > 0) continue;
    const averageHunger = members.reduce((sum, person) => sum + person.hunger, 0) / members.length;
    if (averageHunger > settings.people.hungerSearchThreshold || countFoodNear(tribe, settings.tribes.stayRadius) < settings.tribes.foodNeededNearby) continue;
    if (!chance(settings.tribes.spawnChance)) continue;
    const child = createPersonNear(tribe, tribe.allegiance);
    child.tribeId = tribe.id;
    state.people.push(child);
    state.nextPersonId += 1;
    tribe.spawnCooldown = settings.tribes.spawnCooldownDays;
    addLog(`${tribe.name} welcomes ${child.name} into the tribe.`);
  }
}

function moveToward(entity, target) {
  if (!target) return;
  const dx = Math.sign(target.x - entity.x);
  const dy = Math.sign(target.y - entity.y);
  const horizontal = Math.abs(target.x - entity.x) >= Math.abs(target.y - entity.y);
  const nextX = clamp(entity.x + (horizontal ? dx : 0), 0, cols - 1);
  const nextY = clamp(entity.y + (horizontal ? 0 : dy), 0, rows - 1);
  if (state.terrain[nextY][nextX].type !== "water") {
    entity.x = nextX;
    entity.y = nextY;
  }
}

function wander(entity) {
  const options = [
    { x: entity.x + 1, y: entity.y },
    { x: entity.x - 1, y: entity.y },
    { x: entity.x, y: entity.y + 1 },
    { x: entity.x, y: entity.y - 1 },
  ].filter((pos) => (
    pos.x >= 0 && pos.x < cols && pos.y >= 0 && pos.y < rows && state.terrain[pos.y][pos.x].type !== "water"
  ));
  const next = options[rand(0, options.length - 1)];
  if (next) {
    entity.x = next.x;
    entity.y = next.y;
  }
}

function updateAllegiance(person) {
  if (!person.alive) return;
  const previous = person.allegiance;
  if (person.faith >= settings.people.playerFaithThreshold && person.faith >= person.rot + settings.people.playerFaithRotMargin) person.allegiance = "player";
  else if (person.rot >= settings.people.fiendRotThreshold && person.rot > person.faith + settings.people.fiendRotFaithMargin) person.allegiance = "fiend";
  else if (person.faith < settings.people.neutralFaithThreshold && person.rot < settings.people.neutralRotThreshold) person.allegiance = "neutral";

  if (previous !== person.allegiance) {
    if (person.allegiance === "player") addLog(`${person.name} now worships the fruit spirit.`, "gold");
    if (person.allegiance === "fiend") addLog(`${person.name} kneels to the Rot Fiend.`, "bad");
    if (person.allegiance === "neutral" && previous !== "neutral") addLog(`${person.name} loses certainty and becomes neutral.`);
  }
}

function influenceFaith(person, amount, reason) {
  const before = person.faith;
  person.faith = clamp(person.faith + amount, 0, 100);
  updateAllegiance(person);
  if (before < settings.people.playerFaithThreshold && person.faith >= settings.people.playerFaithThreshold && person.allegiance === "player") {
    addLog(`${person.name} believes after ${reason}.`, "gold");
  }
}

function influenceRot(person, amount, reason) {
  const before = person.rot;
  person.rot = clamp(person.rot + amount, 0, 100);
  if (amount > 0) person.faith = clamp(person.faith - Math.ceil(amount / 3), 0, 100);
  updateAllegiance(person);
  if (before < settings.people.fiendRotThreshold && person.rot >= settings.people.fiendRotThreshold && person.allegiance === "fiend") {
    addLog(`${person.name} turns rotten after ${reason}.`, "bad");
  }
}

function killPerson(person, reason) {
  if (!person.alive) return;
  person.alive = false;
  person.action = "dead";
  addLog(`${person.name} died from ${reason}.`, "bad");
  for (const witness of livingPeople().filter((candidate) => distance(candidate, person) <= 4)) {
    influenceFaith(witness, -settings.player.deathWitnessFaithLoss, "witnessing death");
    witness.fear = clamp(witness.fear + settings.player.deathWitnessFearGain, 0, 100);
  }
}

function simulatePerson(person) {
  if (!person.alive) return;

  const tile = state.terrain[person.y][person.x];
  person.hunger = clamp(person.hunger + rand(settings.people.hungerGainMin, settings.people.hungerGainMax), 0, 100);
  person.fear = clamp(person.fear - 2, 0, 100);
  if (tile.rot > 0) influenceRot(person, settings.people.rotTerrainGain, "walking through rot");
  if (state.sicknessTicks > 0 && chance(settings.people.sicknessDamageChance)) person.health = clamp(person.health - rand(settings.people.sicknessDamageMin, settings.people.sicknessDamageMax), 0, 100);
  if (person.blessed > 0) {
    person.blessed -= 1;
    person.health = clamp(person.health + 4, 0, 100);
    person.rot = clamp(person.rot - 2, 0, 100);
  }

  if (person.hunger >= settings.people.starvationThreshold) {
    person.health = clamp(person.health - rand(settings.people.starvationDamageMin, settings.people.starvationDamageMax), 0, 100);
    person.action = "starving";
    influenceFaith(person, -settings.people.starvationFaithLoss, "hunger went unanswered");
    influenceRot(person, settings.people.starvationRotGain, "desperation made rot persuasive");
  }

  if (person.health <= 0) {
    killPerson(person, person.hunger > 85 ? "starvation" : "sickness");
    return;
  }

  const tribe = personTribe(person);
  if (tribe && distance(person, tribe) > settings.tribes.returnRadius) {
    person.action = "returning to tribe";
    moveToward(person, tribe);
    return;
  }

  if (tile.food > 0 && person.hunger > 25) {
    tile.food -= 1;
    person.hunger = clamp(person.hunger - rand(25, 40), 0, 100);
    person.health = clamp(person.health + rand(2, 6), 0, 100);
    person.action = "eating fruit";
    influenceFaith(person, state.scentTicks > 0 ? settings.miracles.sweetScentFruitFaithGain : settings.miracles.fruitFaithGain, "finding fruit");
    return;
  }

  if (person.allegiance === "player" && chance(settings.player.sacrificeChance)) {
    const animal = nearestLiving(person, state.animals);
    if (animal && animal.score <= 2) {
      animal.alive = false;
      gainFaith(rand(settings.player.sacrificeFaithMin, settings.player.sacrificeFaithMax));
      person.action = "sacrificing animal";
      addLog(`${person.name} sacrifices a ${animal.kind.toLowerCase()} and grants you faith.`, "gold");
      return;
    }
  }

  if (person.hunger > settings.people.hungerSearchThreshold || state.scentTicks > 0) {
    const food = nearestFood(person);
    person.action = food ? "seeking fruit" : "searching hungry";
    food ? moveToward(person, food) : wander(person);
    return;
  }

  if (person.allegiance === "player" && chance(settings.player.prayerChance)) {
    gainFaith(1);
    person.action = "praying";
    return;
  }

  if (person.allegiance === "fiend" && state.fiend.alive && chance(settings.fiend.cultPrayerChance)) {
    state.fiend.faith += 1;
    person.action = "muttering rot prayers";
    return;
  }

  if (person.health < settings.people.restHealthThreshold) {
    person.health = clamp(person.health + rand(settings.people.restHealthMin, settings.people.restHealthMax), 0, 100);
    person.action = "resting";
    return;
  }

  person.action = chance(35) ? "telling stories" : "wandering";
  if (person.action === "wandering") {
    if (tribe && distance(person, tribe) > settings.tribes.stayRadius) moveToward(person, tribe);
    else wander(person);
  }
}

function simulateAnimals() {
  for (const animal of state.animals.filter((item) => item.alive)) {
    if (chance(settings.animals.wanderChance)) wander(animal);
  }
}

function defendersFor(target) {
  const tribe = personTribe(target);
  const nearby = livingPeople().filter((person) => {
    if (person.id === target.id) return true;
    if (distance(person, target) > settings.combat.defenseRadius) return false;
    if (tribe && person.tribeId === tribe.id) return chance(settings.combat.defenderJoinChance + 20);
    return chance(settings.combat.defenderJoinChance);
  });
  return nearby;
}

function resolveMonsterAttack(monster, target) {
  const defenders = defendersFor(target);
  const tribe = personTribe(target);
  const defensePower = defenders.reduce((sum, person) => sum + combatSkill(person), 0) + (tribe ? tribeMembers(tribe).length * settings.combat.tribeDefenseBonusPerMember : 0);
  const monsterDamage = rand(settings.monsters.attackDamageMin, settings.monsters.attackDamageMax);
  const reducedDamage = Math.max(4, monsterDamage - defenders.length * settings.combat.monsterDamageReductionPerDefender - Math.floor(defensePower / 6));
  const defenderDamage = defenders.reduce((sum) => sum + rand(settings.combat.defenderDamageMin, settings.combat.defenderDamageMax), 0);

  monster.health = clamp(monster.health - defenderDamage, 0, settings.monsters.baseHealth);
  monster.fear = clamp(monster.fear + Math.floor(defensePower / settings.combat.monsterFearPerDefense), 0, 100);

  if (monster.health <= 0) {
    monster.alive = false;
    target.action = "survived beast attack";
    gainFaith(settings.combat.killMonsterFaithGain);
    addLog(`${defenders.length} defenders kill a ${monster.kind.toLowerCase()} near ${target.name}.`, "good");
    return;
  }

  if (defensePower >= monsterDamage * settings.combat.highDefenseMultiplier || monster.fear >= settings.monsters.fleeFearThreshold) {
    monster.fleeCooldown = settings.monsters.fleeCooldownDays;
    target.action = "rallied defenders";
    addLog(`${defenders.length} defenders drive off a ${monster.kind.toLowerCase()} before it can maul ${target.name}.`, "good");
    return;
  }

  const finalDamage = defensePower >= monsterDamage * settings.combat.lowDefenseMultiplier ? Math.ceil(reducedDamage / 2) : reducedDamage;
  target.health = clamp(target.health - finalDamage, 0, 100);
  target.fear = clamp(target.fear + settings.monsters.attackFearGain, 0, 100);
  influenceFaith(target, -settings.monsters.attackFaithLoss, "being mauled by a beast");
  target.action = defenders.length > 1 ? "fighting beast" : target.health < settings.combat.fleeHealthThreshold ? "fleeing beast" : "mauled by beast";
  addLog(`${monster.kind} hits ${target.name} for ${finalDamage} damage despite ${defenders.length} defenders.`, finalDamage > 18 ? "bad" : "");
  if (target.health <= 0) killPerson(target, `a ${monster.kind.toLowerCase()} attack`);
}

function simulateMonsters() {
  for (const monster of state.monsters.filter((item) => item.alive)) {
    monster.fear = Math.max(0, monster.fear - settings.monsters.fearDecayPerDay);
    monster.fleeCooldown = Math.max(0, monster.fleeCooldown || 0);
    if (monster.fleeCooldown > 0 || monster.fear >= settings.monsters.fleeFearThreshold) {
      monster.fleeCooldown = Math.max(monster.fleeCooldown - 1, 0);
      monster.action = "fleeing defenders";
      wander(monster);
      continue;
    }
    const targetPerson = nearestLiving(monster, livingPeople());
    const targetAnimal = nearestLiving(monster, state.animals);
    const target = targetPerson && (!targetAnimal || targetPerson.score <= targetAnimal.score + 1) ? targetPerson : targetAnimal;
    if (!target || target.score > settings.monsters.detectionRange) {
      monster.action = "prowling";
      wander(monster);
      continue;
    }
    moveToward(monster, target);
    monster.action = "hunting";
    if (distance(monster, target) === 0) {
      if ("health" in target) {
        resolveMonsterAttack(monster, target);
      } else {
        target.alive = false;
        addLog(`${monster.kind} eats a ${target.kind.toLowerCase()}.`);
      }
    }
  }
}

function fiendTargetScore(target) {
  let score = distance(state.fiend, target);
  if ("health" in target) {
    const tribe = personTribe(target);
    if (tribe) {
      const members = tribeMembers(tribe).length;
      if (tribe.allegiance === "fiend") score -= settings.tribes.fiendTribeAttraction;
      else score += members * settings.tribes.deterrencePerMember;
    }
  }
  return score;
}

function nearestFiendTarget() {
  const candidates = [...livingPeople(), ...state.animals.filter((animal) => animal.alive)];
  let best = null;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const score = fiendTargetScore(candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  if (best) best.score = Math.max(0, bestScore);
  return best;
}

function spreadRotAround(source, radius, strength) {
  for (let y = Math.max(0, source.y - radius); y <= Math.min(rows - 1, source.y + radius); y += 1) {
    for (let x = Math.max(0, source.x - radius); x <= Math.min(cols - 1, source.x + radius); x += 1) {
      if (distance(source, { x, y }) <= radius && state.terrain[y][x].type !== "water") {
        state.terrain[y][x].rot = clamp(state.terrain[y][x].rot + strength, 0, 10);
        if (state.terrain[y][x].rot >= 7) state.terrain[y][x].type = "rot";
      }
    }
  }
}

function simulateFiend() {
  const fiend = state.fiend;
  if (!fiend.alive) return;

  fiend.cooldown -= 1;
  fiend.eatCooldown = Math.max(0, (fiend.eatCooldown || 0) - 1);
  const people = livingPeople();
  const target = nearestFiendTarget();

  if (target) moveToward(fiend, target);
  if (chance(settings.fiend.rotSpreadChance)) spreadRotAround(fiend, 1, 1);

  if (target && distance(fiend, target) === 0 && fiend.eatCooldown <= 0) {
    const targetTribe = "health" in target ? personTribe(target) : null;
    const devourChance = targetTribe?.allegiance === "fiend" ? settings.fiend.ownTribeDevourChance : settings.fiend.devourChance;
    if (!chance(devourChance)) return;
    if ("health" in target) {
      killPerson(target, "being devoured by the Rot Fiend");
      fiend.faith += target.allegiance === "fiend" ? settings.fiend.devourFaithFromFollower : settings.fiend.devourFaithFromOther;
    } else {
      target.alive = false;
      fiend.faith += settings.fiend.animalDevourFaith;
      addLog("The Rot Fiend swallows an animal whole.", "bad");
    }
    fiend.eatCooldown = settings.fiend.eatCooldownDays;
    return;
  }

  if (fiend.cooldown > 0 || people.length === 0) return;
  fiend.cooldown = rand(settings.fiend.cooldownMin, settings.fiend.cooldownMax);
  const miracle = rand(1, 3);

  if (miracle === 1) {
    let spoiled = 0;
    for (let i = 0; i < settings.fiend.spoilAttempts; i += 1) {
      const x = clamp(fiend.x + rand(-settings.fiend.spoilRadius, settings.fiend.spoilRadius), 0, cols - 1);
      const y = clamp(fiend.y + rand(-settings.fiend.spoilRadius, settings.fiend.spoilRadius), 0, rows - 1);
      if (state.terrain[y][x].food > 0) {
        state.terrain[y][x].food = Math.max(0, state.terrain[y][x].food - rand(settings.fiend.spoilFoodMin, settings.fiend.spoilFoodMax));
        state.terrain[y][x].rot = clamp(state.terrain[y][x].rot + settings.fiend.spoilRotGain, 0, 10);
        spoiled += 1;
      }
    }
    addLog(`The Rot Fiend spoils ${spoiled} fruit patches.`, "bad");
  } else if (miracle === 2) {
    const victims = people.sort((a, b) => distance(fiend, a) - distance(fiend, b)).slice(0, settings.fiend.whisperVictims);
    for (const victim of victims) influenceRot(victim, rand(settings.fiend.whisperRotMin, settings.fiend.whisperRotMax), "the fiend whispered decay");
    addLog("The Rot Fiend whispers decay into mortal dreams.", "bad");
  } else {
    const cultist = fiendFollowers()[0] || people[rand(0, people.length - 1)];
    influenceRot(cultist, settings.fiend.rotBlessingGain, "a rot blessing took root");
    cultist.health = clamp(cultist.health + settings.fiend.rotBlessingHealthGain, 0, 100);
    addLog(`The Rot Fiend blesses ${cultist.name} with a wet black crown.`, "bad");
  }
}

function maybeTriggerEvent() {
  if (state.event || state.day < settings.events.firstEventDay || state.day % settings.events.intervalDays !== 0 || !chance(settings.events.chance)) return;
  const events = [
    { type: "drought", title: "Drought", cost: settings.events.droughtCost, text: "The grove dries out. Fruit begins to fail." },
    { type: "sickness", title: "Sickness", cost: settings.events.sicknessCost, text: "A coughing sickness moves through the camp." },
    { type: "beast", title: "Beast Tracks", cost: settings.events.beastCost, text: "Fresh tracks circle the tribe. A monster is near." },
    { type: "rotBloom", title: "Rot Bloom", cost: settings.events.rotBloomCost, text: "Purple fungus blooms from the soil." },
    { type: "badOmen", title: "Bad Omen", cost: settings.events.badOmenCost, text: "The people dream of fruit rotting in their hands." },
  ];
  state.event = events[rand(0, events.length - 1)];
  applyEventStart(state.event);
}

function applyEventStart(event) {
  addLog(`${event.title}: ${event.text}`, "bad");
  if (event.type === "drought") {
    for (const row of state.terrain) {
      for (const tile of row) if (tile.food > 0 && chance(settings.events.droughtFoodLossChance)) tile.food -= 1;
    }
  }
  if (event.type === "sickness") state.sicknessTicks = settings.events.sicknessDuration;
  if (event.type === "beast") state.monsters.push(spawnMonster());
  if (event.type === "rotBloom") spreadRotAround(state.fiend, settings.events.rotBloomRadius, settings.events.rotBloomStrength);
  if (event.type === "badOmen") {
    for (const person of livingPeople()) influenceFaith(person, -settings.events.badOmenFaithLoss, "a bad omen went unanswered");
  }
}

function answerEvent() {
  if (!state.event || !spendFaith(state.event.cost)) return;
  const event = state.event;
  if (event.type === "sickness") state.sicknessTicks = 0;
  if (event.type === "rotBloom") cleanseArea(targetPosition(), 8);
  if (event.type === "beast") {
    const monster = state.monsters.find((item) => item.alive);
    if (monster) monster.alive = false;
  }
  if (event.type === "drought") growFruitNear(targetPosition(), 14, 3);
  if (event.type === "badOmen") for (const person of livingPeople()) influenceFaith(person, settings.events.badOmenAnswerFaithGain, "a god answered the omen");
  addLog(`You answer the ${event.title.toLowerCase()} with fruit-domain power.`, "good");
  state.event = null;
  draw();
  renderUi();
}

function checkDivinity() {
  state.maxFaithHeld = Math.max(state.maxFaithHeld, state.faith);
  if (state.maxFaithHeld >= settings.divinity2FaithThreshold) state.divinity2Unlocked = true;
  state.divinity = state.divinity2Unlocked ? 2 : 1;
}

function checkEnd() {
  const alive = livingPeople().length;
  const yours = playerFollowers().length;
  const theirs = fiendFollowers().length;
  if (!state.fiend.alive) {
    state.ended = true;
    addLog("Victory: lightning splits the Rot Fiend and the tribe remembers your name.", "gold");
  } else if (yours >= settings.winFollowers) {
    state.ended = true;
    addLog("Victory: the tribe becomes an orchard cult strong enough to resist the fiend.", "gold");
  } else if (alive === 0) {
    state.ended = true;
    addLog("Defeat: no living voices remain to worship anything.", "bad");
  } else if (theirs >= settings.loseFiendFollowers) {
    state.ended = true;
    addLog("Defeat: the Rot Fiend claims enough worshippers to drown your cult.", "bad");
  }
}

function tick() {
  if (state.paused || state.ended) return;
  state.day += 1;
  if (state.scentTicks > 0) state.scentTicks -= 1;
  if (state.sicknessTicks > 0) state.sicknessTicks -= 1;

  for (const person of state.people) simulatePerson(person);
  updateTribes();
  simulateAnimals();
  simulateMonsters();
  simulateFiend();
  maybeTriggerEvent();
  checkDivinity();
  checkEnd();

  if (!state.ended && state.day % 5 === 0) {
    addLog(`${livingPeople().length} live. ${playerFollowers().length} follow you; ${fiendFollowers().length} follow rot.`);
  }

  draw();
  renderUi();
}

function spendFaith(cost) {
  if (state.faith < cost || state.ended) return false;
  state.faith -= cost;
  checkDivinity();
  return true;
}

function growFruitNear(center, count, faithGain) {
  let grown = 0;
  for (let i = 0; i < count; i += 1) {
    const x = clamp(center.x + rand(-4, 4), 0, cols - 1);
    const y = clamp(center.y + rand(-4, 4), 0, rows - 1);
    const tile = state.terrain[y][x];
    if (tile.type !== "water") {
      tile.type = "fruit";
      tile.food = clamp(tile.food + rand(2, 5), 1, 10);
      tile.rot = clamp(tile.rot - 3, 0, 10);
      grown += 1;
    }
  }
  for (const person of livingPeople()) if (distance(person, center) <= settings.miracles.growFruitRadius) influenceFaith(person, faithGain, "witnessing sudden fruit");
  return grown;
}

function growFruit() {
  if (!spendFaith(settings.miracles.growFruitCost)) return;
  const center = targetPosition();
  const grown = growFruitNear(center, settings.miracles.growFruitPatches, settings.miracles.growFruitFaithGain);
  addLog(`You grow ${grown} patches of miraculous fruit.`, "good");
  draw();
  renderUi();
}

function blessVitality() {
  if (!state.selectedId) {
    addLog("Choose a living person before blessing vitality.", "bad");
    renderUi();
    return;
  }
  const person = state.people.find((candidate) => candidate.id === state.selectedId && candidate.alive);
  if (!person || !spendFaith(settings.miracles.blessVitalityCost)) return;
  person.health = clamp(person.health + settings.miracles.blessHealthGain, 0, 100);
  person.hunger = clamp(person.hunger - settings.miracles.blessHungerReduction, 0, 100);
  person.rot = clamp(person.rot - settings.miracles.blessRotReduction, 0, 100);
  person.blessed = settings.miracles.blessTicks;
  influenceFaith(person, settings.miracles.blessFaithGain, "feeling divine sweetness in their blood");
  addLog(`You bless ${person.name} with fruit vitality.`, "good");
  draw();
  renderUi();
}

function sweetScent() {
  if (!spendFaith(settings.miracles.sweetScentCost)) return;
  state.scentTicks = settings.miracles.sweetScentTicks;
  for (const person of livingPeople()) influenceFaith(person, settings.miracles.sweetScentFaithGain, "smelling impossible blossoms");
  addLog("A sweet scent spreads; hungry people seek fruit more eagerly.", "good");
  draw();
  renderUi();
}

function greatHarvest() {
  if (state.divinity < 2 || !spendFaith(settings.miracles.greatHarvestCost)) return;
  const grown = growFruitNear(targetPosition(), settings.miracles.greatHarvestPatches, settings.miracles.greatHarvestFaithGain);
  addLog(`Great Harvest floods the land with ${grown} fruit patches.`, "gold");
  draw();
  renderUi();
}

function cleanseArea(center, radius) {
  for (let y = Math.max(0, center.y - radius); y <= Math.min(rows - 1, center.y + radius); y += 1) {
    for (let x = Math.max(0, center.x - radius); x <= Math.min(cols - 1, center.x + radius); x += 1) {
      if (distance(center, { x, y }) <= radius) {
        state.terrain[y][x].rot = 0;
        if (state.terrain[y][x].type === "rot") state.terrain[y][x].type = "grass";
      }
    }
  }
  for (const person of livingPeople()) {
    if (distance(person, center) <= radius) {
      person.rot = clamp(person.rot - settings.miracles.cleanseRotReduction, 0, 100);
      person.fear = clamp(person.fear - settings.miracles.cleanseFearReduction, 0, 100);
      influenceFaith(person, settings.miracles.cleanseFaithGain, "rot was cleansed nearby");
    }
  }
}

function cleanseRot() {
  if (state.divinity < 2 || !spendFaith(settings.miracles.cleanseRotCost)) return;
  cleanseArea(targetPosition(), settings.miracles.cleanseRadius);
  addLog("You cleanse rot from soil and souls.", "good");
  draw();
  renderUi();
}

function driveBeast() {
  if (state.divinity < 2 || !spendFaith(settings.miracles.driveBeastCost)) return;
  const monster = nearestLiving(targetPosition(), state.monsters);
  if (monster) {
    const realMonster = state.monsters.find((item) => item.id === monster.id);
    realMonster.alive = false;
    addLog(`You drive away a ${realMonster.kind.toLowerCase()}.`, "good");
  } else {
    addLog("No living monster answers your challenge.");
  }
  draw();
  renderUi();
}

function lightningFiend() {
  if (state.divinity < 2 || !state.fiend.alive || !spendFaith(settings.miracles.lightningFiendCost)) return;
  state.fiend.alive = false;
  checkEnd();
  draw();
  renderUi();
}

function drawTerrain() {
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tile = state.terrain[y][x];
      ctx.fillStyle = terrainColors[tile.type];
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      if (tile.rot > 0) {
        ctx.fillStyle = `rgba(128, 61, 155, ${tile.rot / 18})`;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      if (tile.food > 0) {
        ctx.fillStyle = "#f0bc54";
        ctx.beginPath();
        ctx.arc(x * tileSize + 16, y * tileSize + 8, 3 + Math.min(tile.food, 5) / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawTribes() {
  for (const tribe of state.tribes) {
    const px = tribe.x * tileSize + tileSize / 2;
    const py = tribe.y * tileSize + tileSize / 2;
    const members = tribeMembers(tribe).length;
    ctx.strokeStyle = tribe.allegiance === "player" ? "rgba(240, 188, 84, 0.85)" : tribe.allegiance === "fiend" ? "rgba(179, 91, 214, 0.85)" : "rgba(245, 234, 211, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(18, members * 3), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawTarget() {
  const target = targetPosition();
  const px = target.x * tileSize + tileSize / 2;
  const py = target.y * tileSize + tileSize / 2;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px - 14, py);
  ctx.lineTo(px + 14, py);
  ctx.moveTo(px, py - 14);
  ctx.lineTo(px, py + 14);
  ctx.stroke();
}

function drawPeople() {
  for (const person of state.people.filter((item) => item.alive)) {
    const px = person.x * tileSize + tileSize / 2;
    const py = person.y * tileSize + tileSize / 2;
    if (person.allegiance === "player") {
      ctx.fillStyle = "rgba(240, 188, 84, 0.35)";
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    if (person.allegiance === "fiend") {
      ctx.fillStyle = "rgba(179, 91, 214, 0.38)";
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = speciesColors[person.species];
    ctx.beginPath();
    ctx.arc(px, py, person.id === state.selectedId ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
    if (person.allegiance === "player") {
      ctx.strokeStyle = "#f0bc54";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (person.allegiance === "fiend") {
      ctx.strokeStyle = "#b35bd6";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (person.id === state.selectedId) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawAnimals() {
  for (const animal of state.animals.filter((item) => item.alive)) {
    ctx.fillStyle = "#d8c78e";
    ctx.fillRect(animal.x * tileSize + 8, animal.y * tileSize + 8, 8, 8);
  }
}

function drawMonsters() {
  for (const monster of state.monsters.filter((item) => item.alive)) {
    ctx.fillStyle = monster.fleeCooldown > 0 || monster.fear >= settings.monsters.fleeFearThreshold ? "#f09a85" : "#d65d4f";
    ctx.beginPath();
    ctx.moveTo(monster.x * tileSize + 12, monster.y * tileSize + 4);
    ctx.lineTo(monster.x * tileSize + 21, monster.y * tileSize + 20);
    ctx.lineTo(monster.x * tileSize + 3, monster.y * tileSize + 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(monster.x * tileSize + 3, monster.y * tileSize + 21, 18, 2);
    ctx.fillStyle = "#b8e385";
    ctx.fillRect(monster.x * tileSize + 3, monster.y * tileSize + 21, 18 * (monster.health / settings.monsters.baseHealth), 2);
  }
}

function drawFiend() {
  if (!state.fiend.alive) return;
  const px = state.fiend.x * tileSize + tileSize / 2;
  const py = state.fiend.y * tileSize + tileSize / 2;
  ctx.fillStyle = "#7c3599";
  ctx.beginPath();
  ctx.arc(px, py, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#171016";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function draw() {
  drawTerrain();
  drawTribes();
  drawAnimals();
  drawPeople();
  drawMonsters();
  drawFiend();
  drawTarget();
}

function meter(label, value, type) {
  return `
    <div class="meter-row"><span>${label}</span><b>${Math.round(value)}</b></div>
    <div class="meter ${type}"><i style="width:${clamp(value, 0, 100)}%"></i></div>
  `;
}

function personHtml(person) {
  const allegiance = person.allegiance === "player" ? "Your follower" : person.allegiance === "fiend" ? "Fiend cultist" : "Neutral";
  const badge = person.allegiance === "player" ? "YOURS" : person.allegiance === "fiend" ? "FIEND" : "NEUTRAL";
  const tribe = personTribe(person);
  return `
    <strong>${person.name} the ${person.species}<span class="badge ${person.allegiance}">${badge}</span></strong>
    <div>${person.personality} | ${person.alive ? person.action : "dead"} | ${allegiance}</div>
    <div>Tribe: ${tribe ? tribe.name : "None"}</div>
    ${meter("Hunger", person.hunger, "hunger")}
    ${meter("Health", person.health, "health")}
    ${meter("Faith", person.faith, "faith")}
    ${meter("Rot", person.rot, "rot")}
  `;
}

function compactPersonHtml(person) {
  const badge = person.allegiance === "player" ? "YOURS" : person.allegiance === "fiend" ? "FIEND" : "NEUTRAL";
  return `
    <strong>${person.name}<span class="badge ${person.allegiance}">${badge}</span></strong>
    <div>${person.species} | ${person.alive ? person.action : "dead"}</div>
    <div class="compact-meters">
      <div class="meter health"><i style="width:${clamp(person.health, 0, 100)}%"></i></div>
      <div class="meter faith"><i style="width:${clamp(person.faith, 0, 100)}%"></i></div>
      <div class="meter rot"><i style="width:${clamp(person.rot, 0, 100)}%"></i></div>
    </div>
  `;
}

function sortedPeople() {
  const order = { player: 0, fiend: 1, neutral: 2 };
  return [...state.people].sort((a, b) => {
    const allegianceSort = order[a.allegiance] - order[b.allegiance];
    if (allegianceSort !== 0) return allegianceSort;
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function settingLabel(path) {
  return path
    .replace(/\./g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSetting(path) {
  return path.split(".").reduce((value, key) => value[key], settings);
}

function setSetting(path, value) {
  const parts = path.split(".");
  let target = settings;
  for (const part of parts.slice(0, -1)) target = target[part];
  target[parts.at(-1)] = value;
}

function collectSettingPaths(source = DEFAULT_GAME_SETTINGS, prefix = "") {
  const paths = [];
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) paths.push(...collectSettingPaths(value, path));
    else if (typeof value === "number") paths.push(path);
  }
  return paths;
}

function renderSettingsFields() {
  const grouped = collectSettingPaths().reduce((groups, path) => {
    const group = path.includes(".") ? path.split(".")[0] : "game";
    groups[group] = groups[group] || [];
    groups[group].push(path);
    return groups;
  }, {});

  ui.settingsFields.innerHTML = Object.entries(grouped).map(([group, paths]) => `
    <fieldset>
      <legend>${settingLabel(group)}</legend>
      ${paths.map((path) => `
        <label>
          <span>${settingLabel(path.replace(`${group}.`, ""))}</span>
          <input type="number" step="1" data-setting-path="${path}" value="${getSetting(path)}">
        </label>
      `).join("")}
    </fieldset>
  `).join("");
}

function openSettings() {
  renderSettingsFields();
  ui.settingsPanel.hidden = false;
}

function closeSettings() {
  ui.settingsPanel.hidden = true;
}

function applySettingsFromForm() {
  for (const input of ui.settingsFields.querySelectorAll("input[data-setting-path]")) {
    setSetting(input.dataset.settingPath, Number(input.value));
  }
  localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  closeSettings();
  restartGame();
}

function resetSettings() {
  settings = clone(DEFAULT_GAME_SETTINGS);
  localStorage.removeItem(settingsStorageKey);
  renderSettingsFields();
  restartGame();
}

function renderMiracleLabels() {
  ui.growFruit.innerHTML = `Grow Fruit <span>${settings.miracles.growFruitCost} faith</span>`;
  ui.blessVitality.innerHTML = `Bless Vitality <span>${settings.miracles.blessVitalityCost} faith</span>`;
  ui.sweetScent.innerHTML = `Sweet Scent <span>${settings.miracles.sweetScentCost} faith</span>`;
  ui.greatHarvest.innerHTML = `Great Harvest <span>${settings.miracles.greatHarvestCost} faith, divinity 2</span>`;
  ui.cleanseRot.innerHTML = `Cleanse Rot <span>${settings.miracles.cleanseRotCost} faith, divinity 2</span>`;
  ui.driveBeast.innerHTML = `Drive Beast <span>${settings.miracles.driveBeastCost} faith, divinity 2</span>`;
  ui.lightningFiend.innerHTML = `Lightning Fiend <span>${settings.miracles.lightningFiendCost} faith, divinity 2</span>`;
}

function renderTribesList() {
  if (state.tribes.length === 0) {
    ui.tribesList.innerHTML = "No tribes yet.";
    return;
  }
  ui.tribesList.innerHTML = state.tribes.map((tribe) => `
    <article class="tribe-row ${tribe.allegiance}">
      <strong>${tribe.name}<span class="badge ${tribe.allegiance}">${tribe.allegiance.toUpperCase()}</span></strong>
      <div>${tribeMembers(tribe).length} members | defense ${tribeDefense(tribe)} | center ${tribe.x},${tribe.y} | spawn ${tribe.spawnCooldown}</div>
    </article>
  `).join("");
}

function renderUi() {
  checkDivinity();
  renderMiracleLabels();
  const yours = playerFollowers().length;
  const theirs = fiendFollowers().length;
  ui.faithPoints.textContent = state.faith;
  ui.divinityLevel.textContent = state.divinity;
  ui.followers.textContent = `${yours} / ${settings.winFollowers}`;
  ui.fiendFollowers.textContent = `${theirs} / ${settings.loseFiendFollowers}`;
  ui.crisisStatus.textContent = state.event ? state.event.title : "None";
  ui.miracleTarget.textContent = `${state.target.x},${state.target.y}`;

  ui.growFruit.disabled = state.faith < settings.miracles.growFruitCost || state.ended;
  ui.blessVitality.disabled = state.faith < settings.miracles.blessVitalityCost || state.ended;
  ui.sweetScent.disabled = state.faith < settings.miracles.sweetScentCost || state.ended;
  ui.greatHarvest.disabled = state.divinity < 2 || state.faith < settings.miracles.greatHarvestCost || state.ended;
  ui.cleanseRot.disabled = state.divinity < 2 || state.faith < settings.miracles.cleanseRotCost || state.ended;
  ui.driveBeast.disabled = state.divinity < 2 || state.faith < settings.miracles.driveBeastCost || state.ended;
  ui.lightningFiend.disabled = state.divinity < 2 || state.faith < settings.miracles.lightningFiendCost || !state.fiend.alive || state.ended;
  ui.answerEvent.disabled = !state.event || state.faith < (state.event?.cost || 0) || state.ended;
  ui.answerEventCost.textContent = `${state.event?.cost || 0} faith`;
  ui.pauseToggle.textContent = state.paused ? "Resume" : "Pause";

  const selected = state.people.find((person) => person.id === state.selectedId);
  ui.selectedPerson.classList.toggle("muted", !selected);
  ui.selectedPerson.innerHTML = selected ? personHtml(selected) : "Click a person on the map.";
  document.querySelector("#eventAlert").classList.toggle("quiet", !state.event);
  ui.currentEvent.innerHTML = state.event ? `${state.event.title}: ${state.event.text}` : "No crisis right now.";
  const nearestMonster = nearestLiving(targetPosition(), state.monsters);
  ui.threats.innerHTML = `
    <div><strong>Rot Fiend</strong>: ${state.fiend.alive ? `alive, ${state.fiend.faith} faith` : "dead"}</div>
    <div><strong>Eat Cooldown</strong>: ${state.fiend.eatCooldown || 0} days</div>
    <div><strong>Monsters</strong>: ${state.monsters.filter((item) => item.alive).length}</div>
    <div><strong>Nearest Monster</strong>: ${nearestMonster ? `${nearestMonster.kind}, ${nearestMonster.health} health, ${nearestMonster.fear} fear` : "none"}</div>
    <div><strong>Animals</strong>: ${state.animals.filter((item) => item.alive).length}</div>
    <div><strong>Tribes</strong>: ${state.tribes.length}</div>
    <div><strong>Sickness</strong>: ${state.sicknessTicks > 0 ? `${state.sicknessTicks} days` : "none"}</div>
  `;
  renderTribesList();

  ui.peopleList.innerHTML = sortedPeople().map((person) => `
    <article class="person-row ${person.allegiance}" data-id="${person.id}">
      ${compactPersonHtml(person)}
    </article>
  `).join("");
  ui.eventLog.innerHTML = state.log.map((event) => `<li class="${event.tone}">${event.text}</li>`).join("");
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((event.clientX - rect.left) * scaleX) / tileSize);
  const y = Math.floor(((event.clientY - rect.top) * scaleY) / tileSize);
  state.target = { x: clamp(x, 0, cols - 1), y: clamp(y, 0, rows - 1) };
  const person = state.people.find((candidate) => candidate.alive && candidate.x === x && candidate.y === y);
  if (person) {
    state.selectedId = person.id;
  }
  draw();
  renderUi();
});

ui.peopleList.addEventListener("click", (event) => {
  const row = event.target.closest(".person-row");
  if (!row) return;
  state.selectedId = Number(row.dataset.id);
  draw();
  renderUi();
});

ui.growFruit.addEventListener("click", growFruit);
ui.blessVitality.addEventListener("click", blessVitality);
ui.sweetScent.addEventListener("click", sweetScent);
ui.greatHarvest.addEventListener("click", greatHarvest);
ui.cleanseRot.addEventListener("click", cleanseRot);
ui.driveBeast.addEventListener("click", driveBeast);
ui.lightningFiend.addEventListener("click", lightningFiend);
ui.answerEvent.addEventListener("click", answerEvent);
ui.settingsToggle.addEventListener("click", openSettings);
ui.closeSettings.addEventListener("click", closeSettings);
ui.applySettings.addEventListener("click", applySettingsFromForm);
ui.resetSettings.addEventListener("click", resetSettings);
ui.pauseToggle.addEventListener("click", () => {
  state.paused = !state.paused;
  renderUi();
});

restartGame();
