(() => {
  "use strict";
  const D = window.SD_DATA;
  const ES = window.SD_ES;
  const UI_ALL = window.SD_UI;

  /* ── dates ─────────────────────────────────────────────── */
  const params = new URLSearchParams(location.search);
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const sameDay = (a, b) => iso(a) === iso(b);
  const daysBetween = (a, b) => Math.round((b - a) / 864e5);
  // ?today=YYYY-MM-DD lets you preview the site as of any date.
  const NOW = params.get("today") ? new Date(parseISO(params.get("today")).getTime() + 12 * 36e5) : new Date();
  const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

  const nthOfMonth = (d) => Math.ceil(d.getDate() / 7);
  const isLastOfMonth = (d) => addDays(d, 7).getMonth() !== d.getMonth();
  const firstWeekday = (y, m, wd) => { const d = new Date(y, m, 1); return addDays(d, (wd - d.getDay() + 7) % 7); };
  const atTime = (d, hhmm) => { const [h, mi] = hhmm.split(":").map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, mi); };

  /** The next monthly beginner group for a weekday whose first class hasn't started yet. */
  function nextGroupStart(wd) {
    const startTime = D.weekly.find((w) => w.weekday === wd && w.course)?.start || "19:00";
    let d = firstWeekday(NOW.getFullYear(), NOW.getMonth(), wd);
    if (NOW >= atTime(d, startTime)) d = firstWeekday(NOW.getFullYear(), NOW.getMonth() + 1, wd);
    return d;
  }
  const isGroupStart = (d) => D.courseStarts.some((c) => c.weekday === d.getDay() && d.getDate() <= 7);

  /* ── language ──────────────────────────────────────────── */
  let lang = "en";
  const ui = () => UI_ALL[lang];
  const tr = (o) => (o ? o[lang] || o.en : "");
  const locale = () => (lang === "es" ? "es-MX" : "en-US");
  const fmt = (d, opts) => new Intl.DateTimeFormat(locale(), opts).format(d);
  const fmtShort = (d) => fmt(d, { weekday: "short", month: "short", day: "numeric" });
  const fmtMD = (d) => fmt(d, { month: "short", day: "numeric" });
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    if (h === 0 && m === 0) return lang === "es" ? "medianoche" : "midnight";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ── occurrences ───────────────────────────────────────── */
  function occurrencesOn(date) {
    const out = [];
    const key = iso(date);
    for (const e of D.events) {
      if (key >= e.start && key <= e.end) out.push({ item: e, type: "event", sort: "00:00", allDay: true });
    }
    for (const w of D.weekly) {
      if (w.weekday !== date.getDay()) continue;
      if (w.weeks && !w.weeks.includes(nthOfMonth(date))) continue;
      const last = !!w.lastOfMonthStart && isLastOfMonth(date);
      const start = last ? w.lastOfMonthStart : w.start;
      const closure = D.closures.find((c) => c.date === key && (!c.ids || c.ids.includes(w.id)));
      out.push({
        item: w, type: w.type, start, end: w.end, sort: start, last, closure,
        newGroup: !!w.course && isGroupStart(date),
      });
    }
    return out.sort((a, b) => a.sort.localeCompare(b.sort));
  }

  /* ── calendar file (.ics) ──────────────────────────────── */
  function downloadICS(date, occ) {
    const it = occ.item;
    const stamp = (d, t) => iso(d).replace(/-/g, "") + (t ? "T" + t.replace(":", "") + "00" : "");
    const v = it.venue ? D.venues[it.venue] : null;
    let dt;
    if (occ.allDay) {
      dt = [`DTSTART;VALUE=DATE:${stamp(parseISO(it.start))}`, `DTEND;VALUE=DATE:${stamp(addDays(parseISO(it.end), 1))}`];
    } else {
      const endDay = occ.end < occ.start ? addDays(date, 1) : date;
      dt = [`DTSTART;TZID=America/Chicago:${stamp(date, occ.start)}`, `DTEND;TZID=America/Chicago:${stamp(endDay, occ.end)}`];
    }
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salsa Dallas//EN", "BEGIN:VEVENT",
      `UID:${it.id}-${iso(date)}@salsadallas.com`, `DTSTAMP:${stamp(TODAY, "00:00")}Z`, ...dt,
      `SUMMARY:${tr(it.title)} (Salsa Dallas)`,
      v ? `LOCATION:${v.name}\\, ${v.address.replace(/,/g, "\\,")}` : "",
      `DESCRIPTION:${tr(it.note).replace(/,/g, "\\,")}`,
      "END:VEVENT", "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `salsa-dallas-${it.id}-${iso(date)}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  // Event delegation for every "Add to calendar" button.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ics]");
    if (!b) return;
    const [d, id] = b.dataset.ics.split("|");
    const date = parseISO(d);
    const occ = occurrencesOn(date).find((o) => o.item.id === id);
    if (occ) downloadICS(date, occ);
  });

  /* ── shared renderers ──────────────────────────────────── */
  const link = (k) => D.links[k] || "#";
  const ext = 'target="_blank" rel="noopener"';

  function occCard(date, o, { compact = false } = {}) {
    const it = o.item, U = ui();
    const v = it.venue ? D.venues[it.venue] : null;
    const time = o.allDay ? U.allWeekend : `${fmtTime(o.start)}`;
    const badges = [
      o.type === "free" ? `<span class="badge b-free">${U.free}</span>` : "",
      o.newGroup ? `<span class="badge b-new">${U.newGroup}</span>` : "",
      o.last && it.lastNote ? `<span class="badge b-note">${esc(tr(it.lastNote))}</span>` : "",
      o.closure ? `<span class="badge b-closed">${esc(o.closure.note ? tr(o.closure.note) : U.closed)}</span>` : "",
    ].join("");
    const book = it.book ? `<a class="btn btn-xs ${o.type === "free" ? "btn-ghost" : "btn-red"}" href="${link(it.book)}" ${ext}>${o.type === "free" ? U.reserve : U.book}</a>`
      : it.url ? `<a class="btn btn-xs btn-gold" href="${link(it.url)}" ${ext}>${U.featuredCta}</a>`
      : v ? `<a class="btn btn-xs btn-ghost" href="${v.map}" ${ext}>${U.directions}</a>` : "";
    return `
      <li class="occ t-${o.type}${o.closure ? " is-closed" : ""}">
        <div class="occ-time">${time}</div>
        <div class="occ-main">
          <strong>${esc(tr(compact ? it.short : it.title))}</strong>
          ${v ? `<span class="occ-venue">${esc(v.name)} · ${esc(v.city)}</span>` : ""}
          ${compact ? "" : `<span class="occ-note">${esc(tr(it.note))}</span>`}
          ${badges ? `<span class="badges">${badges}</span>` : ""}
        </div>
        ${compact ? "" : `<div class="occ-act">${o.closure ? "" : book}
          <button type="button" class="ics-btn" data-ics="${iso(date)}|${it.id}" title="${U.addCal}" aria-label="${U.addCal}">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8v10H5V10h14Zm-8 2v3H8v2h3v3h2v-3h3v-2h-3v-3h-2Z"/></svg>
          </button></div>`}
      </li>`;
  }

  /* ── hero / next group ─────────────────────────────────── */
  function renderHero() {
    const U = ui();
    const starts = D.courseStarts.map((c) => ({ ...c, date: nextGroupStart(c.weekday) })).sort((a, b) => a.date - b.date);
    document.getElementById("next-label").textContent = U.nextGroup;
    document.getElementById("next-options").innerHTML = starts.map((s) => {
      const n = daysBetween(TODAY, s.date);
      return `
        <a class="next-opt" href="${link(s.link)}" ${ext}>
          <span class="no-day">${esc(fmt(s.date, { weekday: "long" }))}</span>
          <span class="no-date">${esc(fmt(s.date, { month: "long", day: "numeric" }))}</span>
          <span class="no-meta">7:00 PM · ${esc(U.startsIn(n))}</span>
          <span class="no-cta">${U.registerFor} →</span>
        </a>`;
    }).join("");
    const first = starts.reduce((a, b) => (a.date < b.date ? a : b));
    document.getElementById("next-rule").textContent = U.rule(fmt(first.date, { weekday: "long", month: "long", day: "numeric" }));

    const btns = starts.map((s) => `<a class="btn btn-red" href="${link(s.link)}" ${ext}>${U.registerFor} · ${esc(fmtShort(s.date))}</a>`).join("");
    document.getElementById("plan-course-btns").innerHTML = btns;
    document.getElementById("fc-btns").innerHTML = btns;
    document.getElementById("fc-sub").textContent = U.fcSub(fmt(starts[0].date, { weekday: "long", month: "long", day: "numeric" }), fmt(starts[1].date, { weekday: "long", month: "long", day: "numeric" }));
    document.getElementById("mb-cta").textContent = U.mbCta(fmtMD(first.date));
  }

  /* ── this week strip ───────────────────────────────────── */
  function renderThisWeek() {
    const U = ui();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(TODAY, i);
      const occ = occurrencesOn(d);
      if (occ.length) days.push({ d, occ, i });
    }
    const el = document.getElementById("tw-list");
    if (!days.length) { el.innerHTML = `<li class="empty">${U.noWeek}</li>`; return; }
    el.innerHTML = days.map(({ d, occ, i }) => `
      <li class="tw-day${i === 0 ? " is-today" : ""}">
        <p class="tw-date"><b>${i === 0 ? U.today : i === 1 ? U.tomorrow : esc(fmt(d, { weekday: "long" }))}</b> ${esc(fmtMD(d))}</p>
        <ul>${occ.map((o) => occCard(d, o, { compact: true })).join("")}</ul>
      </li>`).join("");
  }

  /* ── featured event banner ─────────────────────────────── */
  function renderFeatured() {
    const U = ui();
    const host = document.getElementById("featured");
    const e = D.events.find((x) => x.featured && daysBetween(TODAY, parseISO(x.end)) >= 0 && daysBetween(TODAY, parseISO(x.start)) <= 45);
    if (!e) { host.innerHTML = ""; return; }
    const n = Math.max(0, daysBetween(TODAY, parseISO(e.start)));
    const range = `${fmt(parseISO(e.start), { month: "long", day: "numeric" })}–${fmt(parseISO(e.end), { day: "numeric" })}`;
    host.innerHTML = `
      <div class="wrap">
        <a class="featured" href="${link(e.url)}" ${ext}>
          <img src="assets/img/dsc_logo_hat_2026_small.png" alt="" width="96" height="96" />
          <div class="f-copy">
            <span class="f-count">${U.daysAway(n)}</span>
            <strong>${esc(tr(e.title))}</strong>
            <span>${esc(range)} · ${esc(D.venues[e.venue].city)}</span>
          </div>
          <span class="btn btn-gold">${U.featuredCta} →</span>
        </a>
      </div>`;
  }

  /* ── weekly view ───────────────────────────────────────── */
  function renderWeekly() {
    const U = ui();
    const order = [1, 2, 3, 4, 5, 6, 0];
    const active = order.filter((wd) => D.weekly.some((w) => w.weekday === wd));
    const nextFor = (wd) => { const c = D.courseStarts.find((x) => x.weekday === wd); return c ? nextGroupStart(wd) : null; };
    document.getElementById("view-week").innerHTML = `<div class="week-cols" style="--cols:${active.length}">` + active.map((wd) => {
      const items = D.weekly.filter((w) => w.weekday === wd).sort((a, b) => a.start.localeCompare(b.start));
      const dayName = U.weekdayLong[wd];
      const freq = items[0].weeks ? U.weeksOf(items[0].weeks.map((n) => U.wk[n]).join(lang === "es" ? " y " : " & "), dayName) : null;
      const ng = nextFor(wd);
      return `
        <div class="wk-col">
          <h3 class="wk-day">${esc(dayName.charAt(0).toUpperCase() + dayName.slice(1))}${freq ? `<small>${esc(freq)}</small>` : `<small>${U.weekly}</small>`}</h3>
          ${items.map((w) => {
            const v = D.venues[w.venue];
            return `
              <article class="wk-item t-${w.type}">
                <p class="wk-time">${fmtTime(w.start)}${w.end && w.type === "free" ? ` <span>${U.till} ${fmtTime(w.end)}</span>` : ` – ${fmtTime(w.end)}`}</p>
                <h4>${esc(tr(w.title))}</h4>
                <p class="wk-venue">${esc(v.name)} · ${esc(v.city)}</p>
                <p class="wk-note">${esc(tr(w.note))}</p>
                ${w.lastNote ? `<p class="wk-flag">${esc(tr(w.lastNote))}</p>` : ""}
                ${w.course && ng ? `<p class="wk-flag wk-new">${U.newGroup}: <b>${esc(fmtMD(ng))}</b></p>` : ""}
                ${w.book ? `<a class="link" href="${link(w.book)}" ${ext}>${w.type === "free" ? U.reserve : U.book} →</a>` : `<a class="link" href="${v.map}" ${ext}>${U.directions} →</a>`}
              </article>`;
          }).join("")}
        </div>`;
    }).join("") + `</div>`;
  }

  /* ── month view ────────────────────────────────────────── */
  let viewY = TODAY.getFullYear(), viewM = TODAY.getMonth(), selected = TODAY;
  function renderMonth() {
    const U = ui();
    const first = new Date(viewY, viewM, 1);
    document.getElementById("m-title").textContent = fmt(first, { month: "long", year: "numeric" });
    const startPad = first.getDay();
    const daysIn = new Date(viewY, viewM + 1, 0).getDate();
    const heads = [0, 1, 2, 3, 4, 5, 6].map((i) => `<div class="m-head" role="columnheader">${esc(fmt(new Date(2026, 1, i + 1), { weekday: "short" }))}</div>`).join("");
    let cells = "";
    for (let i = 0; i < startPad; i++) cells += `<div class="m-cell m-pad"></div>`;
    for (let day = 1; day <= daysIn; day++) {
      const d = new Date(viewY, viewM, day);
      const occ = occurrencesOn(d);
      const cls = ["m-cell", d < TODAY ? "is-past" : "", sameDay(d, TODAY) ? "is-today" : "", sameDay(d, selected) ? "is-sel" : "", occ.length ? "has" : ""].join(" ");
      cells += `
        <button type="button" class="${cls}" data-date="${iso(d)}" aria-label="${esc(fmt(d, { weekday: "long", month: "long", day: "numeric" }))}, ${occ.length}">
          <span class="m-num">${day}</span>
          <span class="m-chips">${occ.map((o) => `<span class="chip t-${o.type}${o.closure ? " is-closed" : ""}">${o.allDay ? "" : `<i>${fmtTime(o.start)}</i> `}${esc(tr(o.item.short))}</span>`).join("")}</span>
          <span class="m-dots">${occ.map((o) => `<i class="t-${o.type}"></i>`).join("")}</span>
        </button>`;
    }
    document.getElementById("m-grid").innerHTML = heads + cells;
    renderDayDetail();
  }
  function renderDayDetail() {
    const U = ui();
    const occ = occurrencesOn(selected);
    document.getElementById("day-detail").innerHTML = `
      <h4>${esc(fmt(selected, { weekday: "long", month: "long", day: "numeric" }))}</h4>
      ${occ.length ? `<ul class="occ-list">${occ.map((o) => occCard(selected, o)).join("")}</ul>` : `<p class="muted">${U.nothing}</p>`}`;
  }
  document.getElementById("m-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-date]");
    if (!b) return;
    selected = parseISO(b.dataset.date);
    document.querySelectorAll(".m-cell.is-sel").forEach((x) => x.classList.remove("is-sel"));
    b.classList.add("is-sel");
    renderDayDetail();
    if (window.matchMedia("(max-width: 860px)").matches) document.getElementById("day-detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  const shiftMonth = (n) => {
    const d = new Date(viewY, viewM + n, 1);
    viewY = d.getFullYear(); viewM = d.getMonth();
    selected = sameDay(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), d) ? TODAY : d;
    renderMonth();
  };
  document.getElementById("m-prev").addEventListener("click", () => shiftMonth(-1));
  document.getElementById("m-next").addEventListener("click", () => shiftMonth(1));

  document.querySelectorAll("[data-view]").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    document.getElementById("view-week").hidden = tab.dataset.view !== "week";
    document.getElementById("view-month").hidden = tab.dataset.view !== "month";
  }));
  // "Full calendar →" and "See dates" jump straight to the month view.
  document.querySelectorAll('a[href="#schedule"]').forEach((a) => a.addEventListener("click", () => document.querySelector('[data-view="month"]').click()));

  /* ── misc sections ─────────────────────────────────────── */
  function renderReviews() {
    document.getElementById("reviews").innerHTML = D.reviews.map((r) => `
      <figure class="review"><blockquote>“${esc(tr(r.text))}”</blockquote><figcaption>★★★★★ ${esc(r.name)} · Google</figcaption></figure>`).join("");
  }
  function renderCommunity() {
    document.getElementById("community-list").innerHTML = D.community.map((c) => `
      <li><span>${esc(tr(c.when))}</span> <b>${c.url ? `<a href="${c.url}" ${ext}>${esc(c.name)}</a>` : esc(c.name)}</b> · ${esc(c.city)}</li>`).join("");
  }
  function wireLinks() {
    document.querySelectorAll("[data-link]").forEach((a) => { a.href = link(a.dataset.link); a.target = "_blank"; a.rel = "noopener"; });
  }

  /* ── language switching ────────────────────────────────── */
  const enCopy = new Map();
  document.querySelectorAll("[data-i18n],[data-i18n-html]").forEach((el) => enCopy.set(el, el.innerHTML));
  function setLang(l) {
    lang = l === "es" ? "es" : "en";
    document.documentElement.lang = lang;
    enCopy.forEach((en, el) => {
      const key = el.dataset.i18n || el.dataset.i18nHtml;
      el.innerHTML = lang === "es" && ES[key] ? ES[key] : en;
    });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("sd-lang", lang); } catch (_) {}
    renderAll();
  }
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  function renderAll() {
    renderHero();
    renderThisWeek();
    renderFeatured();
    renderWeekly();
    renderMonth();
    renderReviews();
    renderCommunity();
    wireLinks();
  }

  document.getElementById("year").textContent = TODAY.getFullYear();
  let initial = params.get("lang");
  if (!initial) { try { initial = localStorage.getItem("sd-lang"); } catch (_) {} }
  if (!initial) initial = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
  setLang(initial);
})();
