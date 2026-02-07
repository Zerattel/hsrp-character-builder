import { activateSection } from './helpers/activateSession.js';
import { 
  START_PHYS,
  START_SKILL,
  HARDCORE_PHYS,
  HARDCORE_SKILL,
  BELONGS,
  CLASSES,
  PHYSICAL_STATS,
} from './system/env.js';
import { 
  currentPhysPool, 
  currentSkillPool, 
  user 
} from './system/store.js'



/* -------------------------------------------------------------------------- */
/*                                  ЛОГИКА UI                                 */
/* -------------------------------------------------------------------------- */


activateSection('section-intro');

function submitName() {
  const input = document.getElementById("input-name");
  if (input.value.trim() === "") {
    alert("Введите имя!");
    return;
  }

  user.name = input.value;
  document.getElementById("hazard-loader").style.display = "block";
  setTimeout(() => {
    document.getElementById("hazard-bar").style.width = "100%";
  }, 50);

  setTimeout(() => {
    input.classList.add("success");
    activateSection("section-belong");
  }, 2200);
}

document.getElementById('submitName').onclick = () => submitName();



/* --------------------------------- БЕЛОНГ --------------------------------- */

const belongGrid = document.getElementById("belong-grid");
BELONGS.forEach((b) => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
            <div class="card-bg" style="background-image: url('${b.img}')"></div>
            <div class="card-header-img" style="background-image: url('${b.img}')"></div>
            <div class="card-content"><div class="card-title">${b.title}</div><div class="card-desc">${b.desc}</div></div>`;
  card.onclick = () => selectCard("belong", b.id, b.title, card);
  belongGrid.appendChild(card);
});


/* --------------------------------- ДРУГОЕ --------------------------------- */

const otherCard = document.createElement("div");
otherCard.className = "card";
otherCard.innerHTML = `
         <div class="card-content" style="justify-content: center;">
            <div class="card-title">ДРУГОЕ</div>
            <input type="text" id="other-belong-input" placeholder="Введите..." style="width: 80%; font-size: 1rem;" onclick="event.stopPropagation()">
        </div>`;
otherCard.onclick = () => selectCard("belong", "other", null, otherCard);
belongGrid.appendChild(otherCard);

let selectedBelongCard = null;
function selectCard(type, id, title, element) {
  if (type === "belong") {
    if (selectedBelongCard) selectedBelongCard.classList.remove("selected");
    selectedBelongCard = element;
    user.belong = id === "other" ? document.getElementById("other-belong-input").value : title;
  } else {
    if (selectedClassCard) selectedClassCard.classList.remove("selected");
    selectedClassCard = element;
    user.classId = id;
    user.className = title;
  }

  element.classList.add("selected");
}

function submitBelong() {
  if (selectedBelongCard?.querySelector("#other-belong-input")) {
    user.belong = document.getElementById("other-belong-input").value;
  }

  if (!user.belong) {
    alert("Выберите происхождение!");
    return;
  }

  activateSection("section-class");
}

document.getElementById('submitBelong').onclick = () => submitBelong();


/* ---------------------------------- КЛАСС --------------------------------- */

const classGrid = document.getElementById("class-grid");
let selectedClassCard = null;
CLASSES.forEach((c) => {
  const card = document.createElement("div");
  card.className = "card wide";
  card.innerHTML = `
            <div class="card-bg" style="background-image: url('${c.img}')"></div>
            <div class="card-header-img" style="background-image: url('${c.img}')"></div>
            <div class="card-content"><div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div></div>`;
  card.onclick = () => selectCard("class", c.id, c.title, card);
  classGrid.appendChild(card);
});

function submitClass() {
  if (!user.classId) {
    alert("Выберите класс!");
    return;
  }

  initStats();
  activateSection("section-stats");
}

document.getElementById('submitClass').onclick = () => submitClass();


/* ------------------------------- СТАТИСТИКА ------------------------------- */

function initStats() {
  const clsObj = CLASSES.find((c) => c.id === user.classId);
  document.getElementById("stats-bg").style.backgroundImage = `url('${clsObj.bg}')`;
  document.getElementById("final-header").innerText =
    `${user.name} | ${user.className} | ${user.belong}`;

  PHYSICAL_STATS.forEach((s) => (user.stats[s] = 0));
  clsObj.skills.forEach((s) => (user.skills[s] = 0));

  renderStats();
}

function renderStats() {
  renderStatsGroup("phys-list", user.stats, updatePhysPool);
  renderStatsGroup("skills-list", user.skills, updateSkillsPool);
  updatePhysPool();
  updateSkillsPool();
}

function renderStatsGroup(containerId, dataObj, updateFunc) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (const [key, value] of Object.entries(dataObj)) {
    const row = document.createElement("div");
    row.className = "stat-row";

    let barHtml = "";
    for (let i = -4; i <= 4; i++) {
      let cls = "bar-segment";
      let active = false;
      if (value < 0 && i < 0 && i >= value) active = true;
      if (value > 0 && i > 0 && i <= value) active = true;
      if (active && i < 0) cls += " neg";
      if (active && i > 0) cls += " pos";
      if (i === 0) cls = "bar-segment zero";
      barHtml += `<div class="${cls}"></div>`;
    }

    row.innerHTML = `
                <div class="stat-header"><strong>${key}</strong></div>
                <div class="stat-control">
                    <div class="stat-bar">${barHtml}</div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="stat-btn" onclick="changeStat('${containerId}', '${key}', -1)">-</button>
                        <span class="stat-value-display">${value}</span>
                        <button class="stat-btn" onclick="changeStat('${containerId}', '${key}', 1)">+</button>
                    </div>
                </div>`;
    container.appendChild(row);
  }
}

window.changeStat = function (containerId, key, delta) {
  const targetObj = containerId === "phys-list" ? user.stats : user.skills;
  const updateFunc = containerId === "phys-list" ? updatePhysPool : updateSkillsPool;
  const newVal = targetObj[key] + delta;
  if (newVal < -4 || newVal > 4) return;
  targetObj[key] = newVal;
  renderStatsGroup(containerId, targetObj, updateFunc);
  updateFunc();
};

function updatePhysPool() {
  const sum = Object.values(user.stats).reduce((a, b) => a + b, 0);
  const remaining = currentPhysPool - sum;
  const el = document.getElementById("pool-phys-val");
  el.innerText = remaining;
  el.style.color = remaining === 0 ? "var(--accent-green)" : "var(--accent-red)";
  document.getElementById("col-phys").classList.toggle("balanced", remaining === 0);
}

function updateSkillsPool() {
  const sum = Object.values(user.skills).reduce((a, b) => a + b, 0);
  const remaining = currentSkillPool - sum;
  const el = document.getElementById("pool-skills-val");
  el.innerText = remaining;
  el.style.color = remaining === 0 ? "var(--accent-green)" : "var(--accent-red)";
  document.getElementById("col-skills").classList.toggle("balanced", remaining === 0);
}


/* ---------------------------- ЛОГИКА ЧЕКБОКСОВ ---------------------------- */

function toggleHardcore() {
  const isHardcore = document.getElementById("chk-hardcore").checked;

  // Сброс всех статов
  for (let k in user.stats) user.stats[k] = 0;
  for (let k in user.skills) user.skills[k] = 0;

  if (isHardcore) {
    currentPhysPool = HARDCORE_PHYS;
    currentSkillPool = HARDCORE_SKILL;
  } else {
    currentPhysPool = START_PHYS;
    currentSkillPool = START_SKILL;
  }
  renderStats();
}

document.getElementById('chk-hardcore').onchange = () => toggleHardcore();


function getStatBar(value) {
  let bar = "";
  for (let i = -4; i <= 4; i++) {
    if (i === 0) {
      bar += "⬜";
    } else if (i < 0) {
      if (value < 0 && i >= value) bar += "🟥";
      else bar += "⬛";
    } else {
      if (value > 0 && i <= value) bar += "🟩";
      else bar += "⬛";
    }
  }
  return bar;
}

function generateAndCopy() {
  const physSum = Object.values(user.stats).reduce((a, b) => a + b, 0);
  const skillSum = Object.values(user.skills).reduce((a, b) => a + b, 0);

  const physRem = currentPhysPool - physSum;
  const skillRem = currentSkillPool - skillSum;
  const isOverride = document.getElementById("chk-override").checked;
  const isHardcore = document.getElementById("chk-hardcore").checked;

  const errorBox = document.getElementById("error-box");

  if (!isOverride && (physRem !== 0 || skillRem !== 0)) {
    document
      .getElementById("error-sound")
      .play()
      .catch(() => {});
    errorBox.style.display = "block";
    return;
  }

  errorBox.style.display = "none";

  // Генерация текста
  let text = `# ${user.name}\n`;
  text += `## ${user.className}\n`;
  text += `## ${user.belong}\n\n`;

  if (isHardcore) text += `💀 **РЕЖИМ: ХАРДКОР**\n`;
  if (isOverride) text += `⚠️ **РЕЖИМ: АВТО-ВАЛИДАЦИЯ ОТКЛЮЧЕНА**\n`;

  text += `\nОписание и характер: СТЕРЕТЬ И СОСТАВИТЬ САМОСТОЯТЕЛЬНО ПЕРЕД ОТПРАВКОЙ\n\n`;
  text += `Предыстория: СТЕРЕТЬ СОСТАВИТЬ САМОСТОЯТЕЛЬНО ПЕРЕД ОТПРАВКОЙ\n\n`;

  text += `## Физические характеристики:\n`;
  text += "```text\n"; // Начало блока кода
  for (const [k, v] of Object.entries(user.stats)) {
    // padEnd(14) делает так, чтобы слово всегда занимало 14 символов
    // Если слово короче, оно добьется пробелами справа
    text += `${k.padEnd(14)} [${getStatBar(v)}] (${v > 0 ? "+" + v : v})\n`;
  }
  text += "```\n"; // Конец блока кода

  text += `\n## Навыки:\n`;
  text += "```text\n";
  for (const [k, v] of Object.entries(user.skills)) {
    text += `${k.padEnd(14)} [${getStatBar(v)}] (${v > 0 ? "+" + v : v})\n`;
  }
  text += "```\n";

  // Копирование в буфер
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".btn-copy");
    const originalText = btn.innerText;
    btn.innerText = "СКОПИРОВАНО!";
    btn.style.background = "#fff";
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "var(--accent-green)";
    }, 2000);
  });
}

document.getElementById('generateAndCopy').onclick = () => generateAndCopy();
