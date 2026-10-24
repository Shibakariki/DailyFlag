const pad = n => String(n).padStart(2, "0");
const EPOCH = Date.UTC(2026, 0, 1); // le défi n°1 correspond au 1er janvier 2026

/** Clé du jour, ex. "2026-10-24" (heure locale du joueur). */
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const dayNumber = (d = new Date()) =>
  Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5) + 1;

/** Temps restant avant minuit, au format HH:MM:SS. */
export function countdownToMidnight(now = new Date()) {
  const ms = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  return `${pad(Math.floor(ms / 36e5))}:${pad(Math.floor(ms % 36e5 / 6e4))}:${pad(Math.floor(ms % 6e4 / 1e3))}`;
}
