import { buildDailyQuiz } from "./game/quiz.js";
import { todayKey, dayNumber, countdownToMidnight } from "./lib/date.js";
import { loadProgress, saveProgress } from "./lib/storage.js";
import * as view from "./ui/view.js";

const dayKey = todayKey();
const quiz = buildDailyQuiz(dayKey);
const results = loadProgress(dayKey); // true/false par question déjà répondue

view.setMeta(`#${dayNumber()} · ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`);

function next() {
  const i = results.length;
  if (i >= quiz.length) return finish();
  view.renderDots(results, quiz.length, i);
  view.renderQuestion(quiz[i], i, quiz.length, picked => answer(picked));
}

function answer(picked) {
  const q = quiz[results.length];
  results.push(picked === q.code);
  saveProgress(dayKey, results);
  view.renderDots(results, quiz.length, -1);
  view.renderAnswer(q, picked, results.length >= quiz.length);
}

function finish() {
  view.renderDots(results, quiz.length, -1);
  view.renderEnd(quiz, results, score =>
    `Daily Flag #${dayNumber()} — ${score}/10\n${results.map(r => (r ? "🟩" : "🟥")).join("")}`);
  const tick = () => view.setCountdown(countdownToMidnight());
  tick();
  setInterval(tick, 1000);
}

view.onNext(next);
next();
