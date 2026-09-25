import { initNavigation, goTo, unlockStep } from './helpers/navigation.js';
import {
  START_PHYS,
  START_SKILL,
  HARDCORE_PHYS,
  HARDCORE_SKILL,
  HARDCORE_PERK,
  BELONGS,
  CLASSES,
  PHYSICAL_STATS,
} from './system/env.js';
import { pools, user } from './system/store.js';
import { loadPerks, isPerkRelevant, isPerkUnlocked, describeRequirement } from './system/perks.js';
import {
  playSound,
  primeMusicOnFirstGesture,
  toggleMute,
  isMuted,
  attachHoverSound,
} from './system/audio.js';

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

/* -------------------------------------------------------------------------- */
/*                              НАВИГАЦИЯ И ЗВУК                              */
/* -------------------------------------------------------------------------- */

initNavigation();
primeMusicOnFirstGesture();
attachHoverSound(document);

const muteBtn = document.getElementById('mute-toggle');
if (muteBtn) {
  muteBtn.textContent = isMuted() ? '🔇' : '🔊';
  muteBtn.onclick = () => {
    const muted = toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  };
}

function attachTilt(el, strength = 12) {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * strength;
    const rotateX = (0.5 - y / rect.height) * strength;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
}

/* --------------------------------- ВВОД ИМЕНИ ------------------------------- */

function submitName() {
  const input = document.getElementById("input-name");
  if (input.value.trim() === "") {
    alert("Введите имя!");
    return;
  }

  user.name = input.value;
  document.getElementById("hazard-loader").style.display = "block";
  playSound('transition');
  setTimeout(() => {
    document.getElementById("hazard-bar").style.width = "100%";
  }, 50);

  setTimeout(() => {
    input.classList.add("success");
    goTo("section-belong");
  }, 2200);
}

document.getElementById('submitName').onclick = () => submitName();

function skipToBuild() {
  playSound('submit');
  const input = document.getElementById("input-name");
  if (!user.name) {
    user.name = input.value.trim() || "Оперативник Инкогнито";
    input.value = user.name;
  }

  unlockStep("section-belong");
  unlockStep("section-class");

  if (!user.belong) {
    const defaultBelong = BELONGS[BELONGS.length - 1]; // Солдат Удачи — рекомендован по умолчанию
    const el = belongCardEls[BELONGS.indexOf(defaultBelong)];
    selectCard("belong", defaultBelong.id, defaultBelong.title, el);
  }

  if (!user.classId) {
    const defaultClass = CLASSES[0];
    const el = classCardEls[0];
    selectCard("class", defaultClass.id, defaultClass.title, el);
  }

  initStats();
  goTo("section-stats");
}

const skipBtn = document.getElementById('skipToBuild');
if (skipBtn) skipBtn.onclick = () => skipToBuild();

/* --------------------------------- БЕЛОНГ --------------------------------- */

const belongGrid = document.getElementById("belong-grid");
const belongCardEls = [];
BELONGS.forEach((b) => {
  const card = document.createElement("div");
  card.className = "card sfx-hover";
  card.innerHTML = `
            <div class="card-bg" style="background-image: url('${b.img}')"></div>
            <div class="card-header-img" style="background-image: url('${b.img}')"></div>
            <div class="card-content"><div class="card-title">${b.title}</div><div class="card-desc">${b.desc}</div></div>`;
  card.onclick = () => selectCard("belong", b.id, b.title, card);
  attachTilt(card);
  belongGrid.appendChild(card);
  belongCardEls.push(card);
});


/* --------------------------------- ДРУГОЕ --------------------------------- */

const otherCard = document.createElement("div");
otherCard.className = "card sfx-hover";
otherCard.innerHTML = `
         <div class="card-content" style="justify-content: center;">
            <div class="card-title">ДРУГОЕ</div>
            <input type="text" id="other-belong-input" placeholder="Введите..." style="width: 80%; font-size: 1rem;" onclick="event.stopPropagation()">
        </div>`;
otherCard.onclick = () => selectCard("belong", "other", null, otherCard);
attachTilt(otherCard);
belongGrid.appendChild(otherCard);
belongCardEls.push(otherCard);

let selectedBelongCard = null;
let selectedClassCard = null;

function selectCard(type, id, title, element) {
  playSound('select');
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
  playSound('submit');
  if (selectedBelongCard?.querySelector("#other-belong-input")) {
    user.belong = document.getElementById("other-belong-input").value;
  }

  if (!user.belong) {
    alert("Выберите происхождение!");
    return;
  }

  goTo("section-class");
}

document.getElementById('submitBelong').onclick = () => submitBelong();


/* ---------------------------------- КЛАСС --------------------------------- */

const classGrid = document.getElementById("class-grid");
const classCardEls = [];
CLASSES.forEach((c) => {
  const card = document.createElement("div");
  card.className = "card wide sfx-hover";
  card.innerHTML = `
            <div class="card-bg" style="background-image: url('${c.img}')"></div>
            <div class="card-header-img" style="background-image: url('${c.img}')"></div>
            <div class="card-content"><div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div></div>`;
  card.onclick = () => selectCard("class", c.id, c.title, card);
  attachTilt(card);
  classGrid.appendChild(card);
  classCardEls.push(card);
});

function submitClass() {
  playSound('submit');
  if (!user.classId) {
    alert("Выберите класс!");
    return;
  }

  initStats();
  goTo("section-stats");
}

// === ЛОГИКА ГЛОБАЛЬНЫХ ТУЛТИПОВ ===
const globalTooltip = document.getElementById('global-tooltip');

window.showTooltip = function(event, statKey) {
    const text = STAT_DESCRIPTIONS[statKey];
    if (!text || !globalTooltip) return;

    globalTooltip.innerHTML = text;
    globalTooltip.classList.add('visible');
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

    const offsetX = 15;
    const offsetY = 15;

    let mouseX = event.clientX;
    let mouseY = event.clientY;

    if (mouseX + tooltipWidth + offsetX > window.innerWidth) {
        mouseX = mouseX - tooltipWidth - offsetX;
    } else {
        mouseX = mouseX + offsetX;
    }

    if (mouseY + tooltipHeight + offsetY > window.innerHeight) {
        mouseY = mouseY - tooltipHeight - offsetY;
    } else {
        mouseY = mouseY + offsetY;
    }

    globalTooltip.style.left = mouseX + 'px';
    globalTooltip.style.top = mouseY + 'px';
}

document.addEventListener('mousemove', moveTooltip);

document.getElementById('submitClass').onclick = () => submitClass();


/* ------------------------------- СТАТИСТИКА ------------------------------- */

function initStats() {
  const clsObj = CLASSES.find((c) => c.id === user.classId);
  document.getElementById("stats-bg").style.backgroundImage = `url('${clsObj.bg}')`;
  document.getElementById("final-header").innerText =
    `${user.name} | ${user.className} | ${user.belong}`;
  document.body.dataset.buildClass = user.classId;

  // ВАЖНО: объекты статов пересоздаются с нуля, а не только зануляются по
  // известным ключам. Раньше при возврате назад и выборе другого класса
  // навыки старого класса оставались в user.skills нетронутыми — суммарно
  // очков оказывалось больше, чем должно быть. Теперь каждый заход в билд
  // с новым классом начинается с чистого листа.
  user.stats = {};
  user.skills = {};
  user.perks = {};

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
                        <button class="stat-btn sfx-hover" onclick="changeStat('${containerId}', '${key}', -1)">-</button>
                        <span class="stat-value-display">${value}</span>
                        <button class="stat-btn sfx-hover" onclick="changeStat('${containerId}', '${key}', 1)">+</button>
                    </div>
                </div>`;
    container.appendChild(row);
  }
}

window.changeStat = function (containerId, key, delta) {
  playSound('select');
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
  updateVisuals();
}

function updateSkillsPool() {
  const sum = Object.values(user.skills).reduce((a, b) => a + b, 0);
  const remaining = pools.skill - sum;
  const el = document.getElementById("pool-skills-val");
  el.innerText = remaining;
  el.style.color = remaining === 0 ? "var(--accent-green)" : "var(--accent-red)";
  document.getElementById("col-skills").classList.toggle("balanced", remaining === 0);
  updateVisuals();
}

function updateVisuals() {
  renderRadar('radar-phys', user.stats, 'radar-phys-caption');
  renderRadar('radar-skills', user.skills, 'radar-skills-caption');
  renderPerks();
}


/* ------------------------------ ЖИВАЯ МАТРИЦА ------------------------------ */
/* Радар-диаграмма, отражающая форму текущего распределения очков персонажа. */

function vertexPoint(cx, cy, r, i, n) {
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function ringPoints(cx, cy, r, n) {
  return Array.from({ length: n }, (_, i) => vertexPoint(cx, cy, r, i, n));
}

function ptsToStr(pts) {
  return pts.map((p) => p.join(',')).join(' ');
}

function shortLabel(key) {
  return key.length > 11 ? key.slice(0, 10) + '…' : key;
}

function classifyBuild(values) {
  const sumAbs = values.reduce((a, b) => a + Math.abs(b), 0);
  if (sumAbs === 0) return '<span class="radar-tag neutral">Матрица не откалибрована</span>';

  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  const spikes = values.filter((v) => Math.abs(v) >= 3).length;

  if (spikes >= 2 && spread >= 5) return '<span class="radar-tag danger">Крайняя специализация</span>';
  if (spikes >= 1 && spread >= 4) return '<span class="radar-tag warn">Узкий специалист</span>';
  if (spread <= 2) return '<span class="radar-tag calm">Универсальный профиль</span>';
  return '<span class="radar-tag mid">Гибридный уклон</span>';
}

function renderRadar(svgId, dataObj, captionId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const keys = Object.keys(dataObj);
  const n = keys.length;
  if (n < 3) {
    svg.innerHTML = '';
    return;
  }

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 108;

  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  let html = '';
  [0.25, 0.5, 0.75, 1].forEach((f) => {
    html += `<polygon points="${ptsToStr(ringPoints(cx, cy, maxR * f, n))}" class="radar-ring" />`;
  });

  const vertices = ringPoints(cx, cy, maxR, n);
  keys.forEach((k, i) => {
    const [x, y] = vertices[i];
    html += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-axis" />`;
  });

  const values = keys.map((k) => dataObj[k]);
  const dataPts = values.map((v, i) => {
    const norm = Math.max(0, Math.min(1, (v + 4) / 8));
    return vertexPoint(cx, cy, norm * maxR, i, n);
  });
  html += `<polygon points="${ptsToStr(dataPts)}" class="radar-data" />`;

  keys.forEach((k, i) => {
    const [x, y] = vertices[i];
    const lx = cx + (x - cx) * 1.2;
    const ly = cy + (y - cy) * 1.2;
    html += `<text x="${lx}" y="${ly}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${shortLabel(k)}</text>`;
  });

  svg.innerHTML = html;
  svg.classList.remove('pulse');
  void svg.getBoundingClientRect();
  svg.classList.add('pulse');

  const caption = document.getElementById(captionId);
  if (caption) caption.innerHTML = classifyBuild(values);
}


/* --------------------------------- ЧЕРТЫ ---------------------------------- */

function toggleDrawnPerk(perk, merged) {
  const unlockedNow = isPerkUnlocked(perk, merged);
  const alreadySelected = Object.prototype.hasOwnProperty.call(user.perks, perk.id);

  if (!unlockedNow && !alreadySelected) return;

  if (alreadySelected) {
    delete user.perks[perk.id];
    playSound('perk_remove');
  } else {
    const sum = Object.values(user.perks).reduce((a, b) => a + b, 0);
    const remaining = pools.perk - sum;
    if (perk.cost > 0 && perk.cost > remaining) {
      playSound('error');
      return;
    }
    user.perks[perk.id] = perk.cost;
    playSound('perk_buy');
  }
  renderPerks();
}

function updatePerkPool() {
  const sum = Object.values(user.perks).reduce((a, b) => a + b, 0);
  const remaining = pools.perk - sum;
  const el = document.getElementById('pool-perks-val');
  if (!el) return;
  el.innerText = remaining;
  el.style.color = remaining < 0 ? 'var(--accent-red)' : remaining === 0 ? 'var(--accent-green)' : '#fff';
}

async function renderPerks() {
  const grid = document.getElementById('perks-grid');
  if (!grid) return;

  const allPerks = await loadPerks();
  const merged = { ...user.stats, ...user.skills };
  const relevant = allPerks.filter((p) => isPerkRelevant(p, merged));

  grid.innerHTML = '';

  if (relevant.length === 0) {
    grid.innerHTML = `<div class="perks-empty">Для текущего билда нет доступных черт. Отредактируй data/perks.json.</div>`;
    updatePerkPool();
    return;
  }

  relevant.forEach((perk) => {
    const unlockedNow = isPerkUnlocked(perk, merged);
    const selected = Object.prototype.hasOwnProperty.call(user.perks, perk.id);

    const card = document.createElement('div');
    card.className = `perk-card sfx-hover ${unlockedNow ? '' : 'locked'} ${selected ? 'selected' : ''}`;

    const costLabel = perk.cost > 0 ? `-${perk.cost}` : `+${Math.abs(perk.cost)}`;
    const costClass = perk.cost > 0 ? 'cost-pos' : 'cost-neg';
    const reqText = perk.requirements.map(describeRequirement).join(' · ');

    card.innerHTML = `
      <div class="perk-emblem-wrap">
        <img class="perk-emblem" src="${perk.emblem}" alt=""
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="perk-emblem-fallback" style="display:none;">${perk.name.charAt(0)}</div>
        ${unlockedNow ? '' : '<div class="perk-lock">🔒</div>'}
      </div>
      <div class="perk-body">
        <div class="perk-title-row">
          <span class="perk-name">${perk.name}</span>
          <span class="perk-cost ${costClass}">${costLabel}</span>
        </div>
        <div class="perk-desc">${perk.description}</div>
        <div class="perk-req">${reqText}</div>
      </div>`;

    card.onclick = () => toggleDrawnPerk(perk, merged);
    attachTilt(card, 6);
    grid.appendChild(card);
  });

  updatePerkPool();
}


/* ---------------------------- ЛОГИКА ЧЕКБОКСОВ ---------------------------- */

function toggleHardcore() {
  const isHardcore = document.getElementById("chk-hardcore").checked;
  playSound('toggle');

  // Полный сброс — включая черты, т.к. пул очков на черты в хардкоре меньше
  // и старый выбор может стать невалидным.
  user.stats = {};
  user.skills = {};
  user.perks = {};
  PHYSICAL_STATS.forEach((s) => (user.stats[s] = 0));
  const clsObj = CLASSES.find((c) => c.id === user.classId);
  if (clsObj) clsObj.skills.forEach((s) => (user.skills[s] = 0));

  if (isHardcore) {
    pools.phys = HARDCORE_PHYS;
    pools.skill = HARDCORE_SKILL;
    pools.perk = HARDCORE_PERK;
  } else {
    pools.phys = START_PHYS;
    pools.skill = START_SKILL;
    pools.perk = 3;
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

async function generateAndCopy() {
  const physSum = Object.values(user.stats).reduce((a, b) => a + b, 0);
  const skillSum = Object.values(user.skills).reduce((a, b) => a + b, 0);
  const perkSum = Object.values(user.perks).reduce((a, b) => a + b, 0);

  const physRem = pools.phys - physSum;
  const skillRem = pools.skill - skillSum;
  const perkRem = pools.perk - perkSum;
  const isOverride = document.getElementById("chk-override").checked;
  const isHardcore = document.getElementById("chk-hardcore").checked;

  const errorBox = document.getElementById("error-box");

  if (!isOverride && (physRem !== 0 || skillRem !== 0 || perkRem < 0)) {
    playSound('error');
    errorBox.style.display = "block";
    return;
  }

  errorBox.style.display = "none";

  let text = `# ${user.name}\n`;
  text += `## ${user.className}\n`;
  text += `## ${user.belong}\n\n`;

  if (isHardcore) text += `💀 **РЕЖИМ: ХАРДКОР**\n`;
  if (isOverride) text += `⚠️ **РЕЖИМ: АВТО-ВАЛИДАЦИЯ ОТКЛЮЧЕНА**\n`;

  text += `\nОписание и характер: СТЕРЕТЬ И СОСТАВИТЬ САМОСТОЯТЕЛЬНО ПЕРЕД ОТПРАВКОЙ\n\n`;
  text += `Предыстория: СТЕРЕТЬ СОСТАВИТЬ САМОСТОЯТЕЛЬНО ПЕРЕД ОТПРАВКОЙ\n\n`;

  text += `## Физические характеристики:\n`;
  text += "```text\n";
  for (const [k, v] of Object.entries(user.stats)) {
    text += `${k.padEnd(14)} [${getStatBar(v)}] (${v > 0 ? "+" + v : v})\n`;
  }
  text += "```\n";

  text += `\n## Навыки:\n`;
  text += "```text\n";
  for (const [k, v] of Object.entries(user.skills)) {
    text += `${k.padEnd(14)} [${getStatBar(v)}] (${v > 0 ? "+" + v : v})\n`;
  }
  text += "```\n";

  const perkIds = Object.keys(user.perks);
  if (perkIds.length) {
    const allPerks = await loadPerks();
    text += `\n## Черты:\n`;
    perkIds.forEach((id) => {
      const perk = allPerks.find((p) => p.id === id);
      if (!perk) return;
      const sign = perk.cost > 0 ? `-${perk.cost}` : `+${Math.abs(perk.cost)}`;
      text += `- ${perk.name} (${sign} очк.)\n`;
    });
  }

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
