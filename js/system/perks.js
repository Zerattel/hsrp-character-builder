// Загрузка и проверка условий черт (перков).

let cachedPerks = null;

export async function loadPerks() {
  if (cachedPerks) return cachedPerks;
  try {
    const res = await fetch('./data/perks.json');
    const json = await res.json();
    cachedPerks = Array.isArray(json.perks) ? json.perks : [];
  } catch (e) {
    console.warn('Не удалось загрузить data/perks.json', e);
    cachedPerks = [];
  }
  return cachedPerks;
}

// Черта показывается только если ВСЕ навыки, на которые она ссылается,
// вообще существуют в текущем билде (т.е. относятся к выбранному классу
// или к физическим статам). Иначе она к этому классу не относится.
export function isPerkRelevant(perk, statsAndSkills) {
  return perk.requirements.every((req) =>
    Object.prototype.hasOwnProperty.call(statsAndSkills, req.skill),
  );
}

function checkRequirement(req, statsAndSkills) {
  const val = statsAndSkills[req.skill];
  if (val === undefined) return false;
  if (req.min !== undefined && val < req.min) return false;
  if (req.max !== undefined && val > req.max) return false;
  return true;
}

export function isPerkUnlocked(perk, statsAndSkills) {
  return perk.requirements.every((req) => checkRequirement(req, statsAndSkills));
}

export function describeRequirement(req) {
  if (req.min !== undefined) {
    return `${req.skill} ≥ ${req.min}`;
  }
  return `${req.skill} ≤ ${req.max}`;
}
