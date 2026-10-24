import { CODES } from "../data/countries.js";
import { tierOf, DAILY_PLAN } from "../data/difficulty.js";
import { similarTo } from "../data/similar.js";
import { mulberry32, seedFromString, makeShuffle } from "../lib/random.js";

/**
 * Construit le quiz du jour (identique pour tous les joueurs d'une même date).
 * Retourne [{ code, tier, options: [code × 4] }, ...]
 */
export function buildDailyQuiz(dayKey) {
  const shuffle = makeShuffle(mulberry32(seedFromString(dayKey)));
  const quiz = [];

  for (const [tier, count] of DAILY_PLAN) {
    const pool = CODES.filter(c => tierOf(c) === tier);
    for (const code of shuffle(pool).slice(0, count)) {
      // 1) d'abord des drapeaux qui ressemblent à la bonne réponse
      const distractors = shuffle(similarTo(code)).slice(0, 3);
      // 2) on complète avec des pays du même niveau si besoin
      const filler = shuffle(pool.filter(c => c !== code && !distractors.includes(c)));
      while (distractors.length < 3) distractors.push(filler.shift());
      quiz.push({ code, tier, options: shuffle([code, ...distractors]) });
    }
  }
  return quiz;
}
