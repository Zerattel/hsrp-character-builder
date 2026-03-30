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
  pools, 
  user 
} from './system/store.js';

const STAT_DESCRIPTIONS = {
  "Сила": "Помимо логик-рп бросков увеличивает мод урона ближних атак на <span class='accent-val'>0.1</span> за очко",
  "Внимательность": "Исключительно логик-рп бонус, определяющий предрасположенность персонажа к внимательному изучению окружения.",
  "Выносливость": "Увеличивает мобильность на <span class='accent-val'>2</span> и макс. здоровье на <span class='accent-val'>10</span> за каждое очко.",
  "Обаятельность": "Способность вашего персонажа к убеждению, устрашению, соблазнению, обаянию и другим сложным социальным приёмам.",
  "Удача": "Бонус на броски, в которых вы полагаетесь на удачу, а так же бонус на обыск. Некоторые вредные рассказчики чувствуют себя раскрепощённее в отношении персонажей с низкой удачей",
  "Стрельба": "<span class='accent-val'>+1</span> на атаки дальнего боя и увеличение дальности стрельбы на <span class='accent-val'>10%</span>",
  "Ближний бой": "<span class='accent-val'>+1</span> на атаки Б/Б",
  "Тактика": "Увеличивает Мобильность на <span class='accent-val'>2</span>. Это влияет на Приоритет первого хода и количество проходимых за ход клеток.",
  "Ловкость": "Влияет на скрытность и логик-рп броски.",
  "Точность": "Снижает Порог Промаха (П/П) на <span class='accent-val'>2</span>",
  "Физ. Подготовка": "Увеличивает здоровье на <span class='accent-val'>20</span> за каждое очко навыка",
  "Дедукция": "Бонус на броски, целью которых является получение подсказки от рассказчика",
  "Мастерство": "Бонус на создание чего-либо из компонентов и на возможность создавать более сложные вещи",
  "Медицина": "Бонус к броскам, связанным с медициной",
  "Инженерия": "Бонус на калибровку и настройку механизмов",
  "Контроль": "Бонус на контроль механизмов вроде манипуляторов, станков и турелей. Большие значения позволяют управлять техникой от автомобилей до космических кораблей. При переходе на класс «Прекогнит» очки из этого атрибута переходят в свободные, а не аннулируются",
  "Тех Подготовка": "Увеличивает бонусы от применения вспомогательных устройств и медицинских препаратов. Броски гранат, развёртывание турелей, запуск дронов, инъекции стимуляторов.",
  "Гармония": "Увеличивает предел концентрации на <span class='accent-val'>10</span> от базовых <span class='accent-val'>50</span>",
  "Терпение": "Бонус к эффективности и времени действия техник на <span class='accent-val'>+1 ход</span> за очко. Не работает на разовые техники.",
  "Чувствительность": "Увеличивает восстановление свободного перегрева на <span class='accent-val'>2</span> ед/раунд (от базовой <span class='accent-val'>5</span> ед/раунд)",
  "Гнев": "Бонус к применению атакующих техник на <span class='accent-val'>20%</span> урона",
  "Спокойствие": "Бонус к применению защитных техник на <span class='accent-val'>20%</span> эффективности. Увеличивает сопротивление барьера на <span class='accent-val'>1</span>",
  "Проницательность": "Бонус к техникам, связанным с изменением, наблюдением и манипуляцией. У техник, зависящих от этого навыка бонусы прописаны в индивидуальном порядке",
  "Память": "<span class='accent-val'>+1</span> к каждому броску на <a href='https://discord.com/channels/1119006900831396001/1306880431169208411/1306880431169208411' target='_blank' style='color: var(--accent-green); text-decoration: underline;'>калибровку</a>",
  "Интеллектуальная гибкость": "Бонус <span class='accent-val'>+1</span> на креативное применение модуля по логик-рп. Уменьшает влияние штрафов на <span class='accent-val'>10%</span> от помех, рэб или натуральных условий за каждое очко",
  "Восприятие": "Мод. броска на установление контакта на <span class='accent-val'>+1</span> за каждое очко навыка. Увеличивает диапазон между нижним и верхним порогом частот при поиске аномалии на <span class='accent-val'>3%</span> за каждое очко. Даёт бонус к логик-рп броскам на восприятие",
  "Сила воли": "Влияет на броски, связанные с перегревом модулей и ремонтом. Также влияет на прямой контроль беспилотниками. Увеличивает максимальное число одновременно контролируемых беспилотников на <span class='accent-val'>1</span> от базового <span class='accent-val'>1</span> за каждое очко. Увеличивает эффективность систем ремонта и откачки брони на <span class='accent-val'>5%</span> за очко. Уменьшает сложность бросков на сохранение перегретых модулей на <span class='accent-val'>1</span> за очко",
  "Реакция": "Реакция даёт бонус на маневрирование, микродисторционные манёвры, уклонения и эффективность кинетического барьера и других реактивных систем. Даёт <span class='accent-val'>4%</span> сопротивления всем типам урона барьера за каждое очко. Даёт <span class='accent-val'>5%</span> бонус к эффективности систем маневрирования.",
  "Харизма": "Глобально влияет на вашу обаятельность как организатора, способность договариваться, налаживать связи, контакты, организовывать звенья и торговать."
};

function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {}); // catch нужен, чтобы браузер не ругался, если не успел прогрузить
    }
}



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
  playSound('select-sound');
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
  playSound('submit-sound');
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
  playSound('submit-sound');
  if (!user.classId) {
    alert("Выберите класс!");
    return;
  }

  initStats();
  activateSection("section-stats");
}

// === ЛОГИКА ГЛОБАЛЬНЫХ ТУЛТИПОВ ===
const globalTooltip = document.getElementById('global-tooltip');

window.showTooltip = function(event, statKey) {
    const text = STAT_DESCRIPTIONS[statKey];
    if (!text || !globalTooltip) return;

    globalTooltip.innerHTML = text;
    globalTooltip.classList.add('visible');
    
    // Сразу позиционируем при наведении
    moveTooltip(event);
}

window.hideTooltip = function() {
    if (!globalTooltip) return;
    globalTooltip.classList.remove('visible');
}

function moveTooltip(event) {
    if (!globalTooltip || !globalTooltip.classList.contains('visible')) return;
    
    const tooltipWidth = globalTooltip.offsetWidth;
    const tooltipHeight = globalTooltip.offsetHeight;
    
    // Отступ от курсора
    const offsetX = 15;
    const offsetY = 15;
    
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    
    // Проверяем, не выходим ли за правый край окна
    if (mouseX + tooltipWidth + offsetX > window.innerWidth) {
        mouseX = mouseX - tooltipWidth - offsetX;
    } else {
        mouseX = mouseX + offsetX;
    }
    
    // Проверяем, не выходим ли за нижний край окна
    if (mouseY + tooltipHeight + offsetY > window.innerHeight) {
        mouseY = mouseY - tooltipHeight - offsetY;
    } else {
        mouseY = mouseY + offsetY;
    }
    
    globalTooltip.style.left = mouseX + 'px';
    globalTooltip.style.top = mouseY + 'px';
}

// Отслеживаем движение мыши по всему окну для плавного следования
document.addEventListener('mousemove', moveTooltip);

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

    const hasDescription = STAT_DESCRIPTIONS[key] ? 'stat-item-help' : '';
    
    row.innerHTML = `
                <div class="stat-header">
                    <strong 
                        class="${hasDescription}" 
                        onmouseover="showTooltip(event, '${key}')" 
                        onmouseout="hideTooltip()"
                    >${key}</strong>
                </div>
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
  playSound('select-sound');
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
  const remaining = pools.phys - sum;
  const el = document.getElementById("pool-phys-val");
  el.innerText = remaining;
  el.style.color = remaining === 0 ? "var(--accent-green)" : "var(--accent-red)";
  document.getElementById("col-phys").classList.toggle("balanced", remaining === 0);
}

function updateSkillsPool() {
  const sum = Object.values(user.skills).reduce((a, b) => a + b, 0);
  const remaining = pools.skill - sum;
  const el = document.getElementById("pool-skills-val");
  el.innerText = remaining;
  el.style.color = remaining === 0 ? "var(--accent-green)" : "var(--accent-red)";
  document.getElementById("col-skills").classList.toggle("balanced", remaining === 0);
}


/* ---------------------------- ЛОГИКА ЧЕКБОКСОВ ---------------------------- */

function toggleHardcore() {
  const isHardcore = document.getElementById("chk-hardcore").checked;

  console.log(user)

  // Сброс всех статов
  for (let k in user.stats) user.stats[k] = 0;
  for (let k in user.skills) user.skills[k] = 0;

  if (isHardcore) {
    pools.phys = HARDCORE_PHYS;
    pools.skill = HARDCORE_SKILL;
  } else {
    pools.phys = START_PHYS;
    pools.skill = START_SKILL;
  }
  renderStats();
}

document.getElementById('chk-hardcore').addEventListener('change', () => toggleHardcore());


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

  const physRem = pools.phys - physSum;
  const skillRem = pools.skill - skillSum;
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
