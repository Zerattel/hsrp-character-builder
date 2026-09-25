/*
  Менеджер звука.
  Все файлы ниже — ЗАГЛУШКИ. Если файла по указанному пути нет, звук просто
  тихо не проигрывается (ошибка гасится) — ничего не сломается.
  Чтобы озвучить интерфейс — положи файл с таким же именем в resources/sounds/.
*/

const SOUND_FILES = {
  // уже существующие в репозитории
  select: './resources/sounds/select.mp3',
  submit: './resources/sounds/submit.mp3',
  error: './resources/sounds/EVE-structure-warning.mp3',

  // заглушки — положи файлы с этими именами, чтобы включить
  hover: './resources/sounds/hover.mp3',
  transition: './resources/sounds/transition.mp3',
  highlight: './resources/sounds/highlight.mp3',
  perk_buy: './resources/sounds/perk-buy.mp3',
  perk_remove: './resources/sounds/perk-remove.mp3',
  toggle: './resources/sounds/toggle.mp3',
};

const MUSIC_FILE = './resources/sounds/music-bg.mp3'; // заглушка фоновой музыки

const VOLUMES = {
  select: 0.5,
  submit: 0.6,
  error: 0.7,
  hover: 0.18,
  transition: 0.4,
  highlight: 0.3,
  perk_buy: 0.55,
  perk_remove: 0.4,
  toggle: 0.4,
};

const STORAGE_KEY = 'hsrp-cc-muted';
let muted = localStorage.getItem(STORAGE_KEY) === '1';

// небольшой пул готовых <audio>, чтобы быстрые повторные звуки (ховеры)
// не спотыкались друг о друга
const pools = {};
const POOL_SIZE = 3;

function getPooledAudio(name) {
  const src = SOUND_FILES[name];
  if (!src) return null;
  if (!pools[name]) {
    pools[name] = Array.from({ length: POOL_SIZE }, () => {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    });
  }
  // берём первый элемент, который сейчас не играет
  return pools[name].find((a) => a.paused) || pools[name][0];
}

export function playSound(name) {
  if (muted) return;
  const audio = getPooledAudio(name);
  if (!audio) return;
  try {
    audio.currentTime = 0;
    audio.volume = VOLUMES[name] ?? 0.5;
    audio.play().catch(() => {});
  } catch (_) {
    /* файла нет или браузер заблокировал — просто молчим */
  }
}

// --- фоновая музыка ---
let musicEl = null;
let musicStarted = false;

function ensureMusicEl() {
  if (musicEl) return musicEl;
  musicEl = document.getElementById('bg-music') || new Audio(MUSIC_FILE);
  musicEl.loop = true;
  musicEl.volume = 0.25;
  return musicEl;
}

export function primeMusicOnFirstGesture() {
  if (musicStarted) return;
  const start = () => {
    if (musicStarted) return;
    musicStarted = true;
    const el = ensureMusicEl();
    if (!muted) el.play().catch(() => {});
    window.removeEventListener('pointerdown', start);
    window.removeEventListener('keydown', start);
  };
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  const el = ensureMusicEl();
  if (muted) {
    el.pause();
  } else if (musicStarted) {
    el.play().catch(() => {});
  }
  return muted;
}

// --- удобные шорткаты для навешивания на элементы ---
export function attachHoverSound(root = document) {
  root.addEventListener(
    'mouseover',
    (e) => {
      const target = e.target.closest('.sfx-hover');
      if (target) playSound('hover');
    },
    true,
  );
}
