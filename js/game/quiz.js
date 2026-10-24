import { CODES } from "../data/countries.js";
import { tierOf, DAILY_PLAN } from "../data/difficulty.js";
import { similarTo } from "../data/similar.js";
import { mulberry32, seedFromString, makeShuffle } from "../lib/random.js";

function buildQuiz(shuffle) {
  const quiz = [];
  for (const [tier, count] of DAILY_PLAN) {
    const pool = CODES.filter(c => tierOf(c) === tier);
    for (const code of shuffle(pool).slice(0, count)) {
      const distractors = shuffle(similarTo(code)).slice(0, 3);
      const filler = shuffle(pool.filter(c => c !== code && !distractors.includes(c)));
      while (distractors.length < 3) distractors.push(filler.shift());
      quiz.push({ code, tier, options: shuffle([code, ...distractors]) });
    }
  }
  return quiz;
}

/**
 * Quiz du jour : déterministe, identique pour tous les joueurs d'une même date.
 */
export function buildDailyQuiz(dayKey) {
  return buildQuiz(makeShuffle(mulberry32(seedFromString(dayKey))));
}

/**
 * Quiz d'entraînement : tirage aléatoire à chaque appel.
 */
export function buildTrainingQuiz() {
  return buildQuiz(makeShuffle(mulberry32(Math.floor(Math.random() * 0xFFFFFFFF))));
}
