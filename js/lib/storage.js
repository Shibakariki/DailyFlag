// Sauvegarde locale de la progression du jour (navigateur du joueur uniquement).
const KEY = "dailyflag2";
const STATS_KEY = "dailyflag_stats";
const DAYS_KEY = "dailyflag_days"; // { "YYYY-MM-DD": [true|false, ...], ... }
const PLAYER_KEY = "dailyflag_player";

export function loadProgress(dayKey) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s && s.key === dayKey ? s.res : [];
  } catch { return []; }
}

export function saveProgress(dayKey, res) {
  try { localStorage.setItem(KEY, JSON.stringify({ key: dayKey, res })); } catch { /* stockage indisponible */ }
}

/** Charge les résultats d'un jour quelconque (null si jamais joué). */
export function loadDayResult(dayKey) {
  try {
    const days = JSON.parse(localStorage.getItem(DAYS_KEY) || "{}");
    return days[dayKey] ?? null;
  } catch { return null; }
}

/** Sauvegarde les résultats d'un jour (progression ou complet). */
export function saveDayResult(dayKey, res) {
  try {
    const days = JSON.parse(localStorage.getItem(DAYS_KEY) || "{}");
    days[dayKey] = res;
    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
  } catch { /* stockage indisponible */ }
}

function randomTag() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function defaultAvatar(seed = "PLAYER", label = "J") {
  const colors = ["#2563eb", "#7c3aed", "#0ea5e9", "#ef4444", "#16a34a", "#f59e0b"];
  let acc = 0;
  for (const ch of seed) acc = (acc * 31 + ch.charCodeAt(0)) | 0;
  const bg = colors[Math.abs(acc) % colors.length];
  const initial = (label || "J").trim().charAt(0).toUpperCase() || "J";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="46" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function loadPlayerProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(PLAYER_KEY) || "null");
    if (p && p.id && p.name) {
      if (!p.avatar) p.avatar = defaultAvatar(p.id, p.name);
      return p;
    }
  } catch { /* ignore malformed value */ }
  const name = `Joueur-${randomTag()}`;
  const id = `p_${Date.now().toString(36)}_${randomTag()}`;
  const next = { id, name, avatar: defaultAvatar(id, name) };
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  return next;
}

export function savePlayerProfile(profile) {
  const next = {
    id: profile.id,
    name: profile.name?.trim() || "Joueur",
    avatar: profile.avatar || defaultAvatar(profile.id, profile.name),
  };
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  return next;
}

const STATS_DEFAULT = { played: 0, totalScore: 0, bestScore: 0, streak: 0, longestStreak: 0, lastDay: null };

export function loadStats() {
  try { return Object.assign({}, STATS_DEFAULT, JSON.parse(localStorage.getItem(STATS_KEY) || "null")); }
  catch { return { ...STATS_DEFAULT }; }
}

function prevDayKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  const p = new Date(y, m - 1, d - 1);
  return `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}-${String(p.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Recalcule les stats à partir de l'historique des jours joués.
 * Seules les parties complètes (10 réponses) comptent.
 */
export function recalculateStats() {
  let days;
  try { days = JSON.parse(localStorage.getItem(DAYS_KEY) || "{}"); }
  catch { days = {}; }

  const completed = Object.entries(days)
    .filter(([, res]) => Array.isArray(res) && res.length >= 10)
    .map(([key, res]) => ({ key, score: res.filter(Boolean).length }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const played = completed.length;
  const totalScore = completed.reduce((sum, d) => sum + d.score, 0);
  const bestScore = completed.reduce((best, d) => Math.max(best, d.score), 0);

  let longestStreak = 0;
  let run = 0;
  let prev = null;
  for (const d of completed) {
    run = prev === prevDayKey(d.key) ? run + 1 : 1;
    if (run > longestStreak) longestStreak = run;
    prev = d.key;
  }

  const done = new Set(completed.map(d => d.key));
  const t = todayKey();
  let cursor = done.has(t) ? t : prevDayKey(t);
  let streak = 0;
  while (done.has(cursor)) {
    streak++;
    cursor = prevDayKey(cursor);
  }

  const next = {
    played,
    totalScore,
    bestScore,
    streak,
    longestStreak,
    lastDay: completed.length ? completed[completed.length - 1].key : null,
  };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  return next;
}

/** Enregistre la fin d'une partie et recalcule les stats globales. */
export function recordCompletion(dayKey, score) {
  void dayKey;
  void score;
  return recalculateStats();
}
