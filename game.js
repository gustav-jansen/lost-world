const canvas = document.querySelector("#world");
const ctx = canvas.getContext("2d");

const ui = {
  faithPoints: document.querySelector("#faithPoints"),
  divinityLevel: document.querySelector("#divinityLevel"),
  followers: document.querySelector("#followers"),
  peopleList: document.querySelector("#peopleList"),
  selectedPerson: document.querySelector("#selectedPerson"),
  eventLog: document.querySelector("#eventLog"),
  growFruit: document.querySelector("#growFruit"),
  blessVitality: document.querySelector("#blessVitality"),
  sweetScent: document.querySelector("#sweetScent"),
  pauseToggle: document.querySelector("#pauseToggle"),
};

const tileSize = 40;
const cols = Math.floor(canvas.width / tileSize);
const rows = Math.floor(canvas.height / tileSize);

const terrainColors = {
  grass: "#365d29",
  forest: "#1f4320",
  water: "#254e6f",
  fruit: "#a9a646",
};

const speciesColors = {
  Human: "#f3d6a0",
  Elf: "#c3e8b0",
  Lizardfolk: "#93d18b",
  Troll: "#a1a6bd",
  Ogre: "#d0a073",
};

const names = ["Aru", "Mira", "Senn", "Tovo", "Ila", "Brak", "Nera", "Oshu", "Venn", "Kala", "Ruk", "Essa"];
const species = ["Human", "Elf", "Lizardfolk", "Troll", "Ogre"];
const personalities = ["cautious", "curious", "bold", "kind", "skeptical", "dreamy"];

const state = {
  faith: 10,
  divinity: 1,
  day: 1,
  paused: false,
  ended: false,
  selectedId: null,
  scentTicks: 0,
  log: [],
  terrain: [],
  people: [],
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function addLog(text, tone = "") {
  state.log.unshift({ text: `Day ${state.day}: ${text}`, tone });
  state.log = state.log.slice(0, 24);
}

function createTerrain() {
  const terrain = [];

  for (let y = 0; y < rows; y += 1) {
    const row = [];
    for (let x = 0; x < cols; x += 1) {
      let tile = "grass";
      if (x > cols - 5 && y > rows - 6) tile = "water";
      if (Math.random() < 0.18) tile = "forest";
      if (Math.random() < 0.06) tile = "fruit";
      row.push({ type: tile, food: tile === "fruit" ? rand(2, 5) : 0 });
    }
    terrain.push(row);
  }

  terrain[6][8] = { type: "fruit", food: 5 };
  terrain[6][9] = { type: "fruit", food: 4 };
  terrain[7][8] = { type: "grass", food: 0 };
  return terrain;
}

function createPeople() {
  return names.slice(0, 10).map((name, index) => ({
    id: index + 1,
    name,
    species: species[index % species.length],
    personality: personalities[index % personalities.length],
    x: rand(6, 10),
    y: rand(5, 8),
    hunger: rand(25, 62),
    health: rand(72, 100),
    faith: rand(0, 18),
    fear: rand(0, 18),
    alive: true,
    action: "waking",
    blessed: 0,
  }));
}

function init() {
  state.terrain = createTerrain();
  state.people = createPeople();
  addLog("A nameless fruit spirit opens one divine eye.", "gold");
  addLog("The wandering tribe searches for food near a wild grove.");
  draw();
  renderUi();
}

function nearestFruit(person) {
  let best = null;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tile = state.terrain[y][x];
      if (tile.food <= 0) continue;
      const candidate = { x, y, food: tile.food };
      const score = distance(person, candidate);
      if (!best || score < best.score) best = { ...candidate, score };
    }
  }

  return best;
}

function moveToward(person, target) {
  if (!target) return;
  const dx = Math.sign(target.x - person.x);
  const dy = Math.sign(target.y - person.y);
  const nextX = clamp(person.x + (Math.abs(target.x - person.x) >= Math.abs(target.y - person.y) ? dx : 0), 0, cols - 1);
  const nextY = clamp(person.y + (nextX === person.x ? dy : 0), 0, rows - 1);

  if (state.terrain[nextY][nextX].type !== "water") {
    person.x = nextX;
    person.y = nextY;
  }
}

function wander(person) {
  const options = [
    { x: person.x + 1, y: person.y },
    { x: person.x - 1, y: person.y },
    { x: person.x, y: person.y + 1 },
    { x: person.x, y: person.y - 1 },
  ].filter((pos) => (
    pos.x >= 0 && pos.x < cols && pos.y >= 0 && pos.y < rows && state.terrain[pos.y][pos.x].type !== "water"
  ));

  const next = options[rand(0, options.length - 1)];
  if (next) {
    person.x = next.x;
    person.y = next.y;
  }
}

function influenceFaith(person, amount, reason) {
  const before = person.faith;
  person.faith = clamp(person.faith + amount, 0, 100);

  if (before < 50 && person.faith >= 50) {
    addLog(`${person.name} the ${person.species} now worships the fruit spirit after ${reason}.`, "gold");
  }
}

function simulatePerson(person) {
  if (!person.alive) return;

  person.hunger = clamp(person.hunger + rand(5, 9), 0, 100);
  person.fear = clamp(person.fear - 2, 0, 100);
  if (person.blessed > 0) {
    person.blessed -= 1;
    person.health = clamp(person.health + 3, 0, 100);
  }

  if (person.hunger >= 86) {
    person.health = clamp(person.health - rand(5, 11), 0, 100);
    person.action = "starving";
    influenceFaith(person, -2, "hunger went unanswered");
  }

  if (person.health <= 0) {
    person.alive = false;
    person.action = "dead";
    addLog(`${person.name} died from hunger and hardship.`, "bad");
    return;
  }

  const tile = state.terrain[person.y][person.x];
  if (tile.food > 0 && person.hunger > 28) {
    tile.food -= 1;
    person.hunger = clamp(person.hunger - rand(28, 42), 0, 100);
    person.health = clamp(person.health + rand(2, 6), 0, 100);
    person.action = "eating fruit";
    influenceFaith(person, state.scentTicks > 0 ? 9 : 4, "finding fruit at the right time");
    return;
  }

  if (person.hunger > 52) {
    const fruit = nearestFruit(person);
    person.action = fruit ? "seeking fruit" : "searching hungry";
    fruit ? moveToward(person, fruit) : wander(person);
    return;
  }

  if (person.faith >= 50 && Math.random() < 0.28) {
    state.faith += 1;
    person.action = "praying";
    return;
  }

  if (state.scentTicks > 0 && Math.random() < 0.45) {
    const fruit = nearestFruit(person);
    person.action = "following sweet scent";
    moveToward(person, fruit);
    return;
  }

  if (person.health < 48) {
    person.health = clamp(person.health + rand(3, 8), 0, 100);
    person.action = "resting";
    return;
  }

  person.action = Math.random() < 0.35 ? "telling stories" : "wandering";
  if (person.action === "wandering") wander(person);
}

function tick() {
  if (state.paused || state.ended) return;

  state.day += 1;
  if (state.scentTicks > 0) state.scentTicks -= 1;

  for (const person of state.people) simulatePerson(person);

  const alive = state.people.filter((person) => person.alive);
  const followers = alive.filter((person) => person.faith >= 50).length;
  state.divinity = followers >= 5 ? 2 : 1;

  if (followers >= 5) {
    state.ended = true;
    addLog("Victory: the tribe names you Orchard-Maker and kneels in worship.", "gold");
  } else if (alive.length === 0) {
    state.ended = true;
    addLog("Defeat: no living voices remain to speak your name.", "bad");
  } else if (state.day % 5 === 0) {
    addLog(`${alive.length} people survive. ${followers} openly worship you.`);
  }

  draw();
  renderUi();
}

function spendFaith(cost) {
  if (state.faith < cost || state.ended) return false;
  state.faith -= cost;
  return true;
}

function growFruit() {
  if (!spendFaith(3)) return;

  const living = state.people.filter((person) => person.alive);
  const center = living[rand(0, living.length - 1)] || { x: 8, y: 6 };
  let grown = 0;

  for (let i = 0; i < 8; i += 1) {
    const x = clamp(center.x + rand(-3, 3), 0, cols - 1);
    const y = clamp(center.y + rand(-3, 3), 0, rows - 1);
    const tile = state.terrain[y][x];
    if (tile.type !== "water") {
      tile.type = "fruit";
      tile.food = clamp(tile.food + rand(2, 4), 1, 8);
      grown += 1;
    }
  }

  for (const person of living) {
    if (distance(person, center) <= 5) influenceFaith(person, 12, "witnessing fruit burst from the soil");
  }

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
  if (!person || !spendFaith(5)) return;

  person.health = clamp(person.health + 35, 0, 100);
  person.hunger = clamp(person.hunger - 12, 0, 100);
  person.blessed = 5;
  influenceFaith(person, 24, "feeling divine sweetness in their blood");
  addLog(`You bless ${person.name} with fruit vitality.`, "good");
  draw();
  renderUi();
}

function sweetScent() {
  if (!spendFaith(4)) return;
  state.scentTicks = 4;
  for (const person of state.people.filter((candidate) => candidate.alive)) {
    influenceFaith(person, 7, "smelling impossible blossoms on the wind");
  }
  addLog("A sweet scent spreads; hungry people seek fruit more eagerly.", "good");
  draw();
  renderUi();
}

function drawTerrain() {
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tile = state.terrain[y][x];
      ctx.fillStyle = terrainColors[tile.type];
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (tile.food > 0) {
        ctx.fillStyle = "#f0bc54";
        ctx.beginPath();
        ctx.arc(x * tileSize + 28, y * tileSize + 13, 4 + Math.min(tile.food, 5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPeople() {
  for (const person of state.people) {
    if (!person.alive) continue;
    const px = person.x * tileSize + tileSize / 2;
    const py = person.y * tileSize + tileSize / 2;

    ctx.fillStyle = speciesColors[person.species];
    ctx.beginPath();
    ctx.arc(px, py, person.id === state.selectedId ? 12 : 9, 0, Math.PI * 2);
    ctx.fill();

    if (person.faith >= 50) {
      ctx.strokeStyle = "#f0bc54";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (person.id === state.selectedId) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function draw() {
  drawTerrain();
  drawPeople();
}

function personHtml(person) {
  const follower = person.faith >= 50 ? "Follower" : "Unconvinced";
  return `
    <strong>${person.name} the ${person.species}</strong>
    <div>${person.personality} | ${person.alive ? person.action : "dead"} | ${follower}</div>
    <div class="meter hunger"><i style="width:${person.hunger}%"></i></div>
    <div class="meter"><i style="width:${person.health}%"></i></div>
    <div class="meter faith"><i style="width:${person.faith}%"></i></div>
  `;
}

function renderUi() {
  const living = state.people.filter((person) => person.alive);
  const followers = living.filter((person) => person.faith >= 50).length;
  ui.faithPoints.textContent = state.faith;
  ui.divinityLevel.textContent = state.divinity;
  ui.followers.textContent = `${followers} / 5`;

  ui.growFruit.disabled = state.faith < 3 || state.ended;
  ui.blessVitality.disabled = state.faith < 5 || state.ended;
  ui.sweetScent.disabled = state.faith < 4 || state.ended;
  ui.pauseToggle.textContent = state.paused ? "Resume" : "Pause";

  const selected = state.people.find((person) => person.id === state.selectedId);
  ui.selectedPerson.classList.toggle("muted", !selected);
  ui.selectedPerson.innerHTML = selected ? personHtml(selected) : "Click a person on the map.";

  ui.peopleList.innerHTML = state.people.map((person) => `
    <article class="person-row ${person.faith >= 50 ? "follower" : ""}" data-id="${person.id}">
      ${personHtml(person)}
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
  const person = state.people.find((candidate) => candidate.alive && candidate.x === x && candidate.y === y);

  if (person) {
    state.selectedId = person.id;
    draw();
    renderUi();
  }
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
ui.pauseToggle.addEventListener("click", () => {
  state.paused = !state.paused;
  renderUi();
});

init();
setInterval(tick, 1600);
