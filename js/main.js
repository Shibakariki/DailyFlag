import { buildDailyQuiz, buildTrainingQuiz } from "./game/quiz.js";
import { todayKey, dayNumber, dayNumberFromKey, formatDayKey, EPOCH_KEY, countdownToMidnight } from "./lib/date.js";
import { loadProgress, saveProgress, loadDayResult, saveDayResult, loadPlayerProfile, savePlayerProfile, recordCompletion } from "./lib/storage.js";
import { isWorldConfigured, loadRemotePlayer, submitAndLoadWorld, upsertPlayerProfile } from "./lib/world.js";
import * as view from "./ui/view.js";

const dayKey = todayKey();
const dateLabel = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
let player = loadPlayerProfile();

let mode = "daily"; // "daily" | "training" | "archive"
let quiz = [];
let results = [];
let cdTimer = null;
let archiveKey = null;

function showTab(tab) {
  clearInterval(cdTimer);
  view.setActiveTab(tab);
  view.setDayPickerVisible(tab !== "training");
  view.setCountriesPickerVisible(tab === "training");
  if (tab === "daily") {
    startDaily();
  } else {
    startTraining();
  }
}

function startDaily() {
  mode = "daily";
  quiz = buildDailyQuiz(dayKey);
  results = loadProgress(dayKey);
  view.setMeta(`#${dayNumber()} · ${dateLabel}`);
  view.showSection("quiz");
  if (results.length >= quiz.length) { finishDaily(); return; }
  nextQuestion();
}

function startTraining() {
  mode = "training";
  quiz = buildTrainingQuiz();
  results = [];
  view.showSection("quiz");
  nextQuestion();
}

function startArchive(k) {
  mode = "archive";
  archiveKey = k;
  quiz = buildDailyQuiz(k);
  results = loadDayResult(k) ?? [];
  view.setMeta(`#${dayNumberFromKey(k)} · ${formatDayKey(k)}`);
  view.setActiveTab("daily");
  view.showSection("quiz");
  if (results.length >= quiz.length) { finishArchive(); return; }
  nextQuestion();
}

function nextQuestion() {
  const i = results.length;
  view.renderDots(results, quiz.length, i);
  view.renderQuestion(quiz[i], i, quiz.length, answer);
}

function answer(picked) {
  const q = quiz[results.length];
  results.push(picked === q.code);
  if (mode === "daily") saveProgress(dayKey, results);
  else if (mode === "archive") saveDayResult(archiveKey, results);
  view.renderDots(results, quiz.length, -1);
  view.renderAnswer(q, picked, results.length >= quiz.length);
}

function onNext() {
  if (results.length >= quiz.length) {
    if (mode === "daily") finishDaily();
    else if (mode === "training") finishTraining();
    else finishArchive();
  } else {
    nextQuestion();
  }
}

function finishDaily() {
  const score = results.filter(Boolean).length;
  saveDayResult(dayKey, results);
  const stats = recordCompletion(dayKey, score);
  view.renderDots(results, quiz.length, -1);
  view.renderEnd(quiz, results, {
    title: "Votre score du jour",
    shareText: s => `Daily Flag #${dayNumber()} — ${s}/10\n${results.map(r => (r ? "🟩" : "🟥")).join("")}`,
  });
  view.renderStats(stats);
  publishWorld(dayKey, score);
  const tick = () => view.setCountdown(countdownToMidnight());
  tick();
  cdTimer = setInterval(tick, 1000);
}

function finishTraining() {
  view.renderDots(results, quiz.length, -1);
  view.renderEnd(quiz, results, {
    title: "Score d'entraînement",
    shareText: s => `Daily Flag – Entraînement — ${s}/10\n${results.map(r => (r ? "🟩" : "🟥")).join("")}`,
    onReplay: startTraining,
  });
}

function finishArchive() {
  const num = dayNumberFromKey(archiveKey);
  const date = formatDayKey(archiveKey);
  saveDayResult(archiveKey, results);
  recordCompletion(archiveKey, results.filter(Boolean).length);
  view.renderDots(results, quiz.length, -1);
  view.renderEnd(quiz, results, {
    title: `Défi du ${date}`,
    shareText: s => `Daily Flag #${num} — ${s}/10\n${results.map(r => (r ? "🟩" : "🟥")).join("")}`,
  });
  publishWorld(archiveKey, results.filter(Boolean).length);
}

async function publishWorld(targetDayKey, score) {
  if (!isWorldConfigured()) {
    view.renderWorldError("Classement mondial non configuré.");
    return;
  }
  view.renderWorldLoading();
  try {
    const data = await submitAndLoadWorld(targetDayKey, score, player);
    view.renderWorld(data,player);
  } catch (err) {
    console.error(err);
    view.renderWorldError("Impossible de charger le classement mondial pour le moment.");
  }
}

async function savePlayerFromEditor(next) {
  player = savePlayerProfile({ ...player, ...next });
  view.renderPlayerProfile(player);
  if (!isWorldConfigured()) return;
  await upsertPlayerProfile(player);
}

function showPlayerError(message) {
  console.error(message);
  alert(message);
}

async function syncPlayerAtStart() {
  view.renderPlayerProfile(player);
  if (!isWorldConfigured()) return;
  try {
    const remote = await loadRemotePlayer(player.id);
    if (remote) {
      player = savePlayerProfile({
        ...player,
        name: remote.name || player.name,
        avatar: remote.avatar || player.avatar,
      });
      view.renderPlayerProfile(player);
    } else {
      await upsertPlayerProfile(player);
    }
  } catch (err) {
    console.error(err);
  }
}

for (const btn of document.querySelectorAll(".top-nav-btn"))
  btn.onclick = () => showTab(btn.dataset.tab);

view.renderDayPicker({
  epochKey: EPOCH_KEY,
  todayKey: dayKey,
  getResult: k => loadDayResult(k),
  onSelect: k => (k === dayKey ? showTab("daily") : startArchive(k)),
});
view.renderCountriesList();
view.bindDayToggle();
view.bindPlayerEditor({ onSave: savePlayerFromEditor, onError: showPlayerError });
syncPlayerAtStart();

view.onNext(onNext);
showTab("daily");
