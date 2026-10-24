import { name } from "../data/countries.js";
import { TIER_LABELS } from "../data/difficulty.js";
import { flagOf } from "../lib/flags.js";

const $ = id => document.getElementById(id);

export const setMeta = text => { $("meta").textContent = text; };

export function renderDots(results, total, current) {
  $("dots").innerHTML = Array.from({ length: total }, (_, i) =>
    `<i class="${i < results.length ? (results[i] ? "ok" : "ko") : i === current ? "cur" : ""}"></i>`).join("");
}

export function renderQuestion(q, index, total, onPick) {
  $("q").classList.remove("hide");
  $("end").classList.add("hide");
  $("tier").textContent = `${index + 1}/${total} · ${TIER_LABELS[q.tier]}`;
  $("flag").textContent = flagOf(q.code);
  $("next").classList.add("hide");
  $("opts").innerHTML = "";
  for (const code of q.options) {
    const b = document.createElement("button");
    b.className = "opt";
    b.dataset.code = code;
    b.textContent = name(code);
    b.onclick = () => onPick(code);
    $("opts").appendChild(b);
  }
}

export function renderAnswer(q, picked, isLast) {
  for (const b of $("opts").children) {
    b.disabled = true;
    if (b.dataset.code === q.code) b.classList.add("ok");
    else if (b.dataset.code === picked) b.classList.add("ko");
  }
  $("next").textContent = isLast ? "Voir mon score" : "Suivant";
  $("next").classList.remove("hide");
  $("next").focus();
}

export const onNext = fn => { $("next").onclick = fn; };

export function renderEnd(quiz, results, shareText) {
  $("q").classList.add("hide");
  $("end").classList.remove("hide");
  const score = results.filter(Boolean).length;
  $("score").textContent = `${score}/10`;
  $("grid").textContent = results.map(r => (r ? "🟩" : "🟥")).join("");
  $("recap").innerHTML = quiz.map((q, i) =>
    `<div><span class="ef">${flagOf(q.code)}</span><span class="${results[i] ? "o" : "k"}">${results[i] ? "✓" : "✗"}</span> ${name(q.code)}</div>`).join("");
  $("share").onclick = async () => {
    try { await navigator.clipboard.writeText(shareText(score)); $("share").textContent = "Copié !"; }
    catch { $("share").textContent = shareText(score); }
  };
}

export const setCountdown = text => { $("cd").textContent = `Prochain défi dans ${text}`; };
