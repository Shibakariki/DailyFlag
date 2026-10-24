const pad = n => String(n).padStart(2, "0");
const EPOCH = Date.UTC(2026, 9, 23); // le défi n°1 correspond au 23 octobre 2026

/** Clé du premier jour du jeu. */
export const EPOCH_KEY = (() => { const d = new Date(EPOCH); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; })();

/** Clé du jour, ex. "2026-10-24" (heure locale du joueur). */
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const dayNumber = (d = new Date()) =>
  Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5) + 1;

/** Numéro du défi pour une clé de jour quelconque. */
export function dayNumberFromKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return dayNumber(new Date(y, m - 1, d));
}

/** Formate une clé de jour en texte lisible, ex. "23 octobre". */
export function formatDayKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

/**
 * Clés des n jours précédant today, du plus récent au plus ancien.
 * Exclut les jours antérieurs à l'époque du jeu.
 */
export function recentDayKeys(n = 6, from = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() - 1 - i);
    return todayKey(d);
  }).filter(k => {
    const [y, m, d] = k.split("-").map(Number);
    return dayNumber(new Date(y, m - 1, d)) >= 1;
  });
}

/** Temps restant avant minuit, au format HH:MM:SS. */
export function countdownToMidnight(now = new Date()) {
  const ms = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  return `${pad(Math.floor(ms / 36e5))}:${pad(Math.floor(ms % 36e5 / 6e4))}:${pad(Math.floor(ms % 6e4 / 1e3))}`;
}
