import { CODES, name } from "../data/countries.js";
import { TIER_LABELS } from "../data/difficulty.js";
import { flagImgHTML } from "../lib/flags.js";

const $ = id => document.getElementById(id);

export const setMeta = text => { $("meta").textContent = text; };
export const showSection = id => ["quiz"].forEach(s => document.getElementById(s).classList.toggle("hide", s !== id));

export function setActiveTab(tab) {
  for (const btn of document.querySelectorAll(".top-nav-btn"))
    btn.classList.toggle("active", btn.dataset.tab === tab);
}

export function setDayPickerVisible(visible) {
  const picker = $("day-toggle")?.parentElement;
  const toggle = $("day-toggle");
  const popup = $("day-popup");
  if (!picker || !toggle || !popup) return;
  if (!visible) {
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    popup.classList.add("hide");
  }
  picker.classList.toggle("hide", !visible);
}

export function setCountriesPickerVisible(visible) {
  const picker = $("countries-toggle")?.parentElement;
  const toggle = $("countries-toggle");
  const popup = $("countries-popup");
  if (!picker || !toggle || !popup) return;
  if (!visible) {
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    popup.classList.add("hide");
  }
  picker.classList.toggle("hide", !visible);
}

export function renderDayPicker(calendarOpts) {
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  renderCalendar($("cal-container"), calendarOpts);
}

export function bindDayToggle() {
  const toggle = $("day-toggle");
  const popup = $("day-popup");
  const countriesToggle = $("countries-toggle");
  const countriesPopup = $("countries-popup");
  if (!toggle || !popup || !countriesToggle || !countriesPopup) return;

  const closePopup = () => {
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    popup.classList.add("hide");
  };

  toggle.onclick = e => {
    e.stopPropagation();
    const isOpen = toggle.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    popup.classList.toggle("hide", !isOpen);
    countriesToggle.classList.remove("open");
    countriesToggle.setAttribute("aria-expanded", "false");
    countriesPopup.classList.add("hide");
  };

  countriesToggle.onclick = e => {
    e.stopPropagation();
    const isOpen = countriesToggle.classList.toggle("open");
    countriesToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    countriesPopup.classList.toggle("hide", !isOpen);
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    popup.classList.add("hide");
  };

  document.addEventListener("click", e => {
    if (!popup.classList.contains("hide") && !popup.contains(e.target) && !toggle.contains(e.target))
      closePopup();
    if (!countriesPopup.classList.contains("hide") &&
        !countriesPopup.contains(e.target) &&
        !countriesToggle.contains(e.target)) {
      countriesToggle.classList.remove("open");
      countriesToggle.setAttribute("aria-expanded", "false");
      countriesPopup.classList.add("hide");
    }
  });
}

export function renderCountriesList() {
  const list = $("countries-list");
  if (!list) return;
  const rows = CODES
    .slice()
    .sort((a, b) => name(a).localeCompare(name(b), "fr"))
    .map(code => `<div class="country-row">${flagImgHTML(code, name(code), "country-flag")}<span>${name(code)}</span></div>`)
    .join("");
  list.innerHTML = rows;
  for (const img of list.querySelectorAll("img[data-fallback]"))
    img.onerror = () => { img.replaceWith(img.dataset.fallback || ""); };
}

let calYear = 0, calMonth = 0;

function renderCalendar(container, { epochKey, todayKey: todayStr, getResult, onSelect }) {
  const p2 = n => String(n).padStart(2, "0");
  const DOW = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
  const [ey, em] = epochKey.split("-").map(Number);
  const [ty, tm] = todayStr.split("-").map(Number);

  function build() {
    const cm = calMonth + 1;
    const lastDate = new Date(calYear, calMonth + 1, 0).getDate();
    const startOffset = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
    const monthLabel = new Date(calYear, calMonth, 1)
      .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      .replace(/^./, c => c.toUpperCase());

    const canPrev = calYear > ey || (calYear === ey && cm > em);
    const canNext = calYear < ty || (calYear === ty && cm < tm);

    let html = `
      <div class="cal-nav">
        <button class="cal-nav-btn" data-dir="prev" ${canPrev ? "" : "disabled"}>◀</button>
        <span class="cal-month-lbl">${monthLabel}</span>
        <button class="cal-nav-btn" data-dir="next" ${canNext ? "" : "disabled"}>▶</button>
      </div>
      <div class="cal-grid">
        ${DOW.map(h => `<span class="cal-hdr">${h}</span>`).join("")}
        ${Array(startOffset).fill("<span></span>").join("")}`;

    for (let d = 1; d <= lastDate; d++) {
      const k = `${calYear}-${p2(cm)}-${p2(d)}`;
      const isToday = k === todayStr;
      const isFuture = k > todayStr;
      const beforeEpoch = k < epochKey;
      const res = (!isToday && !isFuture && !beforeEpoch) ? getResult(k) : null;
      const done = Array.isArray(res) && res.length >= 10;
      const disabled = isFuture || beforeEpoch;
      const cls = ["cal-day", isToday ? "today" : "", done ? "done" : ""].filter(Boolean).join(" ");

      let tip = "";
      if (isToday) tip = ` title="Défi du jour"`;
      else if (done) {
        const score = res.filter(Boolean).length;
        const grid = res.map(r => (r ? "🟩" : "🟥")).join("");
        tip = ` title="${score}/10\n${grid}"`;
      }

      html += `<button class="${cls}" ${disabled ? "disabled" : `data-key="${k}"`}${tip}>${d}</button>`;
    }
    html += `</div>`;
    container.innerHTML = html;

    const prev = container.querySelector("[data-dir=prev]");
    const next = container.querySelector("[data-dir=next]");
    if (prev) prev.onclick = () => { if (--calMonth < 0) { calMonth = 11; calYear--; } build(); };
    if (next) next.onclick = () => { if (++calMonth > 11) { calMonth = 0; calYear++; } build(); };
    const toggle = $("day-toggle");
    const popup = $("day-popup");
    for (const btn of container.querySelectorAll(".cal-day[data-key]")) {
      btn.onclick = () => {
        onSelect(btn.dataset.key);
        if (toggle && popup) {
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          popup.classList.add("hide");
        }
      };
    }
  }
  build();
}

export function renderDots(results, total, current) {
  $("dots").innerHTML = Array.from({ length: total }, (_, i) =>
    `<i class="${i < results.length ? (results[i] ? "ok" : "ko") : i === current ? "cur" : ""}"></i>`).join("");
}

export function renderQuestion(q, index, total, onPick) {
  $("q").classList.remove("hide");
  $("end").classList.add("hide");
  $("tier").textContent = `${index + 1}/${total} · ${TIER_LABELS[q.tier]}`;
  $("flag").innerHTML = flagImgHTML(q.code, name(q.code), "flag-img");
  const img = $("flag").querySelector("img");
  if (img) img.onerror = () => { img.replaceWith(img.dataset.fallback || ""); };
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

export function renderEnd(quiz, results, { title = "Votre score du jour", shareText, onReplay } = {}) {
  $("q").classList.add("hide");
  $("end").classList.remove("hide");
  $("end-title").textContent = title;
  $("stats").innerHTML = "";
  $("cd").textContent = "";
  const score = results.filter(Boolean).length;
  $("score").textContent = `${score}/10`;
  $("grid").textContent = results.map(r => (r ? "🟩" : "🟥")).join("");
  $("recap").innerHTML = quiz.map((q, i) =>
    `<div><span class="recap-flag">${flagImgHTML(q.code, name(q.code), "recap-flag-img")}</span><span class="${results[i] ? "o" : "k"}">${results[i] ? "✓" : "✗"}</span> ${name(q.code)}</div>`).join("");
  for (const img of $("recap").querySelectorAll("img[data-fallback]"))
    img.onerror = () => { img.replaceWith(img.dataset.fallback || ""); };
  $("share").onclick = async () => {
    try { await navigator.clipboard.writeText(shareText(score)); $("share").textContent = "Copié !"; }
    catch { $("share").textContent = shareText(score); }
  };
  const replayBtn = $("replay");
  replayBtn.classList.toggle("hide", !onReplay);
  if (onReplay) replayBtn.onclick = onReplay;
}

export function renderStats(stats) {
  const el = $("stats");
  if (!el) return;
  const rate = stats.played > 0 ? Math.round(stats.totalScore / (stats.played * 10) * 100) : 0;
  const items = [
    { val: `${stats.streak}${stats.streak > 0 ? " 🔥" : ""}`, lbl: "Série actuelle" },
    { val: stats.longestStreak,                                  lbl: "Meilleure série" },
    { val: stats.played,                                         lbl: "Parties jouées" },
    { val: `${stats.bestScore}/10`,                              lbl: "Meilleur score" },
    { val: `${rate}\u202f%`,                                     lbl: "Réussite" },
  ];
  el.innerHTML = items.map(({ val, lbl }) =>
    `<div class="stat"><span class="stat-val">${val}</span><span class="stat-lbl">${lbl}</span></div>`
  ).join("");
}

export const setCountdown = text => { $("cd").textContent = `Prochain défi dans ${text}`; };
