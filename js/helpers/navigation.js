// Управление шагами анкеты. Всегда активна ровно ОДНА секция — свободный
// скролл между ними отключён, поэтому невозможно вернуться наверх страницы
// и повторно "настакать" очки через случайный повторный сабмит старой формы.

export const STEP_ORDER = ['section-intro', 'section-belong', 'section-class', 'section-stats'];

const backStack = [];
const unlocked = new Set([STEP_ORDER[0]]);
const visited = new Set([STEP_ORDER[0]]);
const listeners = [];

let currentId = STEP_ORDER[0];

function setSectionVisible(id) {
  STEP_ORDER.forEach((sid) => {
    const el = document.getElementById(sid);
    if (!el) return;
    if (sid === id) {
      el.hidden = false;
      el.classList.remove('leaving');
      // requestAnimationFrame нужен, чтобы transition сыграл, а не был съеден
      requestAnimationFrame(() => el.classList.add('active'));
    } else {
      el.classList.remove('active');
      el.hidden = true;
    }
  });
}

function renderStepper() {
  const currentIdx = STEP_ORDER.indexOf(currentId);
  document.querySelectorAll('.step-item').forEach((item) => {
    const sid = item.dataset.step;
    const idx = STEP_ORDER.indexOf(sid);
    item.classList.toggle('active', sid === currentId);
    item.classList.toggle('done', idx < currentIdx);
    item.classList.toggle('locked', !unlocked.has(sid));
  });

  const fill = document.getElementById('step-nav-fill');
  if (fill) {
    const percent = (currentIdx / (STEP_ORDER.length - 1)) * 100;
    fill.style.width = `${percent}%`;
  }

  document.querySelectorAll('.btn-back').forEach((btn) => {
    btn.classList.toggle('hidden', backStack.length === 0);
  });
}

function emit(id) {
  listeners.forEach((cb) => cb(id));
}

export function onNavigate(cb) {
  listeners.push(cb);
}

export function currentStep() {
  return currentId;
}

export function goTo(id, { record = true } = {}) {
  if (id === currentId || !STEP_ORDER.includes(id)) return;
  if (record) backStack.push(currentId);
  currentId = id;
  unlocked.add(id);
  visited.add(id);
  setSectionVisible(id);
  renderStepper();
  emit(id);
}

export function unlockStep(id) {
  if (!STEP_ORDER.includes(id)) return;
  unlocked.add(id);
  visited.add(id);
  renderStepper();
}

export function goBack() {
  const prev = backStack.pop();
  if (!prev) return;
  currentId = prev;
  setSectionVisible(prev);
  renderStepper();
  emit(prev);
}

export function initNavigation() {
  setSectionVisible(currentId);
  document.querySelectorAll('.step-item').forEach((item) => {
    item.addEventListener('click', () => {
      const sid = item.dataset.step;
      if (unlocked.has(sid) && sid !== currentId) {
        backStack.push(currentId);
        currentId = sid;
        setSectionVisible(sid);
        renderStepper();
        emit(sid);
      }
    });
  });
  document.querySelectorAll('.btn-back').forEach((btn) => {
    btn.addEventListener('click', () => goBack());
  });
  renderStepper();
}
