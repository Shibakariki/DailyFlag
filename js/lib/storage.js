// Sauvegarde locale de la progression du jour (navigateur du joueur uniquement).
const KEY = "dailyflag2";

export function loadProgress(dayKey) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s && s.key === dayKey ? s.res : [];
  } catch { return []; }
}

export function saveProgress(dayKey, res) {
  try { localStorage.setItem(KEY, JSON.stringify({ key: dayKey, res })); } catch { /* stockage indisponible */ }
}
