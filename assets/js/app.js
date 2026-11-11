(() => {
  "use strict";
  const D = window.SD_DATA;
  const ES = window.SD_ES;
  const UI_ALL = window.SD_UI;
  const $ = (id) => document.getElementById(id);

  /* ── dates (always Dallas time) ───────────────────────── */
  const params = new URLSearchParams(location.search);
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const sameDay = (a, b) => iso(a) === iso(b);
  const daysBetween = (a, b) => Math.round((b - a) / 864e5);
  const atTime = (d, hhmm) => { const [h, mi] = hhmm.split(":").map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, mi); };
  function dallasNow() {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  }
  // ?today=YYYY-MM-DD previews the site as of noon on any date; ?now=YYYY-MM-DDTHH:MM sets an exact Dallas time.
  const nowParam = params.get("now") && params.get("now").match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/);
  const NOW = nowParam ? atTime(parseISO(nowParam[1]), nowParam[2])
    : params.get("today") ? atTime(parseISO(params.get("today")), "12:00") : dallasNow();
  const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

  const nthOfMonth = (d) => Math.ceil(d.getDate() / 7);
  const isLastOfMonth = (d) => addDays(d, 7).getMonth() !== d.getMonth();

  /* ── language + placeholders ──────────────────────────── */
  let lang = "en";
  let T = {};
  const ui = () => UI_ALL[lang];
  const tr = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.en || "");
  const fill = (s) => String(s).replace(/\{\{(\w+)\}\}/g, (m, k) => (k in T ? T[k] : m));
  const tf = (o) => fill(tr(o));
  const locale = () => (lang === "es" ? "es-MX" : "en-US");
  const fmt = (d, opts) => new Intl.DateTimeFormat(locale(), opts).format(d);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtMD = (d) => fmt(d, { month: "short", day: "numeric" });
  const fmtLong = (d) => cap(fmt(d, { weekday: "long", month: "long", day: "numeric" }));
  const fmtShort = (d) => cap(fmt(d, lang === "es" ? { weekday: "long", day: "numeric", month: "short" } : { weekday: "short", month: "short", day: "numeric" }));
  const fmtRange = (a, b, opts) => {
    const f = new Intl.DateTimeFormat(locale(), opts);
    return f.formatRange ? f.formatRange(a, b) : `${f.format(a)} – ${f.format(b)}`;
  };
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    if (h === 0 && m === 0) return ui().midnight;
    return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`;
  }
  function fmtTimeRange(a, b) {
    const [na, pa] = fmtTime(a).split(" "), [nb, pb] = fmtTime(b).split(" ");
    return pa && pa === pb ? `${na}–${nb} ${pb}` : `${fmtTime(a)}–${fmtTime(b)}`;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const weekly = (id) => D.weekly.find((w) => w.id === id);
  /** "1st & 3rd Wednesdays", "Every Friday"… */
  function frequency(it, { plural = true } = {}) {
    const U = ui();
    if (!it.weeks || it.weeks.length >= 5) return U.every(it.weekday);
    if (it.weeks.join() === "1,2,3,4") return U.firstFour(it.weekday);
    const day = plural ? U.weekdayPlural[it.weekday] : U.weekdayLong[it.weekday];
    return U.weeksOf(it.weeks.map((n) => U.wk[n]).join(U.and), day);
  }
  function computeTokens() {
    const money = (n) => `$${n}`;
    const course = D.weekly.find((w) => w.course);
    const bay = weekly("bay-wed"), fri = weekly("alex-fri");
    T = {
      promoPrice: money(D.promo.price), promoCode: D.promo.code,
      courseTime: fmtTime(course.start), courseRange: fmtTimeRange(course.start, course.end),
      bayTime: fmtTime(bay.start), bayDays: frequency(bay),
      friTime: fmtTime(fri.start), friLastTime: fmtTime(fri.lastOfMonthStart || fri.start),
      bachataTime: fmtTime(weekly("bachata-beg-tue").start), iaTime: fmtTime(weekly("salsa-ia-thu").start),
      phone: D.contact.phoneDisplay, email: D.contact.email,
    };
    for (const [k, v] of Object.entries(D.prices)) T[k] = money(v);
  }

  /* ── schedule engine ──────────────────────────────────── */
  const closureFor = (date, it) => D.closures.find((c) => c.date === iso(date) && (!c.ids || c.ids.includes(it.id)));
  const isCancelled = (date, it) => { const c = closureFor(date, it); return !!c && (c.status || "cancelled") === "cancelled"; };
  const runsOn = (it, d) => it.weekday === d.getDay() && (!it.weeks || it.weeks.includes(nthOfMonth(d)));

  /** First class of the month's beginner group (skips cancelled dates). */
  function groupStart(it, y, m) {
    const first = new Date(y, m, 1);
    for (let d = first; d.getMonth() === first.getMonth(); d = addDays(d, 1)) {
      if (runsOn(it, d) && !isCancelled(d, it)) return d;
    }
    return null;
  }
  /** Next group whose first class hasn't started yet, relative to `from`. */
  function nextGroupStart(it, from = NOW) {
    for (let k = 0; k < 14; k++) {
      const d = groupStart(it, from.getFullYear(), from.getMonth() + k);
      if (d && from < atTime(d, it.start)) return d;
    }
    return null;
  }
  function courseWeek(it, date) {
    const gs = groupStart(it, date.getFullYear(), date.getMonth());
    if (!gs || date < gs) return 0;
    let n = 0;
    for (let d = gs; d <= date; d = addDays(d, 7)) if (runsOn(it, d) && !isCancelled(d, it)) n++;
    return n;
  }

  function occurrencesOn(date) {
    const out = [];
    const key = iso(date);
    for (const e of D.events) {
      if (key >= e.start && key <= e.end) out.push({ item: e, type: "event", sort: "00:00", allDay: true });
    }
    for (const w of D.weekly) {
      if (!runsOn(w, date)) continue;
      const last = !!w.lastOfMonthStart && isLastOfMonth(date);
      const start = last ? w.lastOfMonthStart : w.start;
      const o = { item: w, type: w.type, start, end: w.end || null, sort: start, last, closure: closureFor(date, w), cancelled: isCancelled(date, w) };
      if (w.course) {
        const gs = groupStart(w, date.getFullYear(), date.getMonth());
        o.newGroup = !!gs && sameDay(gs, date);
        o.open = o.newGroup && NOW < atTime(date, w.start); // registration for this group still open
        o.week = courseWeek(w, date);
        o.nextStart = gs && NOW < atTime(gs, w.start) ? gs : nextGroupStart(w, NOW > atTime(date, w.start) ? NOW : atTime(date, w.start));
      }
      out.push(o);
    }
    return out.sort((a, b) => a.sort.localeCompare(b.sort));
  }

  /* ── calendar file (.ics) ─────────────────────────────── */
  function downloadICS(date, occ) {
    const it = occ.item;
    const stamp = (d, t) => iso(d).replace(/-/g, "") + (t ? "T" + t.replace(":", "") + "00" : "");
    const icsEsc = (s) => String(s).replace(/[,;\\]/g, (c) => "\\" + c);
    const v = it.venue ? D.venues[it.venue] : null;
    const dt = occ.allDay
      ? [`DTSTART;VALUE=DATE:${stamp(parseISO(it.start))}`, `DTEND;VALUE=DATE:${stamp(addDays(parseISO(it.end), 1))}`]
      : [`DTSTART;TZID=America/Chicago:${stamp(date, occ.start)}`,
         occ.end ? `DTEND;TZID=America/Chicago:${stamp(occ.end < occ.start ? addDays(date, 1) : date, occ.end)}` : ""];
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salsa Dallas//EN",
      "BEGIN:VTIMEZONE", "TZID:America/Chicago",
      "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0600", "TZOFFSETTO:-0500", "TZNAME:CDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
      "BEGIN:STANDARD", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0600", "TZNAME:CST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
      "END:VTIMEZONE", "BEGIN:VEVENT",
      `UID:${it.id}-${iso(date)}@salsadallas.com`, `DTSTAMP:${stamp(TODAY, "00:00")}Z`, ...dt,
      `SUMMARY:${icsEsc(tr(it.title))} (Salsa Dallas)`,
      v ? `LOCATION:${icsEsc(`${v.name}, ${v.street}, ${v.cityLine}`)}` : "",
      `DESCRIPTION:${icsEsc(tf(it.note))}`,
      "END:VEVENT", "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `salsa-dallas-${it.id}-${iso(date)}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ics]");
    if (!b) return;
    const [d, id] = b.dataset.ics.split("|");
    const date = parseISO(d);
    const occ = occurrencesOn(date).find((o) => o.item.id === id);
    if (occ) downloadICS(date, occ);
  });

  /* ── shared renderers ─────────────────────────────────── */
  const link = (k) => D.links[k] || "#";
  const ext = 'target="_blank" rel="noopener"';
  const btn = (href, label, cls = "btn-ghost") => `<a class="btn btn-xs ${cls}" href="${href}" ${ext}>${esc(label)}</a>`;

  function badgesFor(o, compact) {
    const U = ui(), it = o.item;
    const b = [];
    if (o.type === "free") b.push(`<span class="badge b-free">${U.free}</span>`);
    if (o.open && !o.cancelled) b.push(`<span class="badge b-new">${U.newGroup}</span>`);
    if (it.course && !o.open && o.week) b.push(`<span class="badge b-note">${esc(compact ? U.weekOf(o.week) : U.weekOfFull(o.week, o.nextStart ? fmtMD(o.nextStart) : ""))}</span>`);
    if (o.last && it.lastNote) b.push(`<span class="badge b-note">${esc(tf(it.lastNote))}</span>`);
    if (o.closure) b.push(`<span class="badge ${o.cancelled ? "b-closed" : "b-confirm"}">${esc(o.closure.note ? tr(o.closure.note) : U.closed)}</span>`);
    return b.join("");
  }
  function itemActions(it) {
    // Only the beginner course gets red buttons, so the one "start here" path stays obvious.
    if (it.actions) return it.actions.map((a) => btn(link(a.link), tf(a.label))).join("");
    const v = D.venues[it.venue];
    return v ? btn(v.map, ui().directions) : "";
  }
  function actionsFor(date, o) {
    const U = ui(), it = o.item;
    if (o.cancelled || date < TODAY) return "";
    if (o.allDay) return it.link ? btn(link(it.link), tf(it.cta) || U.featuredCta, "btn-gold") : "";
    if (it.course) {
      if (o.open) return btn(link(it.book), U.register, "btn-red");
      return o.nextStart ? btn(link(it.book), U.registerFor(fmtMD(o.nextStart)), "btn-red") : "";
    }
    return itemActions(it);
  }
  function occCard(date, o, { compact = false } = {}) {
    const it = o.item, U = ui();
    const v = it.venue ? D.venues[it.venue] : null;
    const badges = badgesFor(o, compact);
    const showIcs = !compact && !o.cancelled && date >= TODAY;
    return `
      <li class="occ t-${o.type}${o.cancelled ? " is-closed" : ""}">
        <div class="occ-time">${o.allDay ? U.allWeekend : fmtTime(o.start)}</div>
        <div class="occ-main">
          <strong>${esc(tr(compact ? it.short : it.title))}</strong>
          ${v ? `<span class="occ-venue">${esc(v.name)} · ${esc(tr(v.area))}</span>` : ""}
          ${compact ? "" : `<span class="occ-note">${esc(tf(it.note))}</span>`}
          ${badges ? `<span class="badges">${badges}</span>` : ""}
        </div>
        ${compact ? "" : `<div class="occ-act">${actionsFor(date, o)}
          ${showIcs ? `<button type="button" class="ics-btn" data-ics="${iso(date)}|${it.id}" aria-label="${esc(`${U.addCal}: ${tr(it.title)}, ${fmtLong(date)}`)}">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8v10H5V10h14Zm-8 2v3H8v2h3v3h2v-3h3v-2h-3v-3h-2Z"/></svg>
          </button>` : ""}</div>`}
      </li>`;
  }

  /* ── hero / next group ────────────────────────────────── */
  function courseStarts() {
    return D.weekly.filter((w) => w.course)
      .map((it) => ({ it, date: nextGroupStart(it) }))
      .filter((s) => s.date)
      .sort((a, b) => a.date - b.date);
  }
  function renderHero() {
    const U = ui();
    const starts = courseStarts();
    $("next-label").textContent = U.nextGroup;
    $("next-options").innerHTML = starts.map((s) => `
        <a class="next-opt" href="${link(s.it.book)}" ${ext}>
          <span class="no-day">${esc(fmt(s.date, { weekday: "long" }))}</span>
          <span class="no-date">${esc(cap(fmt(s.date, { month: "long", day: "numeric" })))}</span>
          <span class="no-meta">${fmtTime(s.it.start)} · ${esc(U.startsIn(daysBetween(TODAY, s.date)))}</span>
          <span class="no-cta">${U.register} →</span>
        </a>`).join("");
    if (!starts.length) return;
    const long = (d) => fmt(d, { weekday: "long", month: "long", day: "numeric" });
    $("next-rule").textContent = U.rule;
    const btns = starts.map((s) => `<a class="btn btn-red" href="${link(s.it.book)}" ${ext}>${U.register} · ${esc(fmtShort(s.date))}</a>`).join("");
    $("plan-course-btns").innerHTML = btns;
    $("fc-btns").innerHTML = btns;
    $("fc-sub").textContent = U.fcSub(starts.map((s) => long(s.date)));
    $("mb-cta").textContent = U.mbCta(fmtMD(starts[0].date));
  }

  /* ── this week strip ──────────────────────────────────── */
  function renderThisWeek() {
    const U = ui();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(TODAY, i);
      const occ = occurrencesOn(d);
      if (occ.length) days.push({ d, occ, i });
    }
    const el = $("tw-list");
    if (!days.length) { el.innerHTML = `<li class="empty">${U.noWeek}</li>`; return; }
    el.innerHTML = days.map(({ d, occ, i }) => `
      <li class="tw-day${i === 0 ? " is-today" : ""}">
        <p class="tw-date"><b>${i === 0 ? U.today : i === 1 ? U.tomorrow : esc(cap(fmt(d, { weekday: "long" })))}</b> ${esc(fmtMD(d))}</p>
        <ul>${occ.map((o) => occCard(d, o, { compact: true })).join("")}</ul>
      </li>`).join("");
  }

  /* ── events ───────────────────────────────────────────── */
  const upcomingEvents = () => D.events.filter((e) => parseISO(e.end) >= TODAY).sort((a, b) => a.start.localeCompare(b.start));
  const eventRange = (e, opts) => fmtRange(parseISO(e.start), parseISO(e.end), opts);
  const eventWhen = (e) => { const v = D.venues[e.venue]; return eventRange(e, { month: "short", day: "numeric", year: "numeric" }) + (v ? ` · ${tr(v.area)}` : ""); };

  function renderFeatured() {
    const U = ui();
    const e = upcomingEvents().find((x) => x.featured && daysBetween(TODAY, parseISO(x.start)) <= 45);
    if (!e) { $("featured").innerHTML = ""; return; }
    const n = daysBetween(TODAY, parseISO(e.start));
    const v = D.venues[e.venue];
    $("featured").innerHTML = `
      <div class="wrap">
        <a class="featured" href="${link(e.link)}" ${ext}>
          ${e.logo ? `<img src="${e.logo}" alt="" width="96" height="96" />` : ""}
          <div class="f-copy">
            <span class="f-count">${n <= 0 ? U.happeningNow : U.daysAway(n)}</span>
            <strong>${esc(tr(e.title))}</strong>
            <span>${esc(eventRange(e, { month: "long", day: "numeric" }))}${v ? ` · ${esc(tr(v.area))}` : ""}</span>
          </div>
          <span class="btn btn-gold">${esc(tf(e.cta) || U.featuredCta)} →</span>
        </a>
      </div>`;
  }

  function renderEvents() {
    const U = ui();
    const up = upcomingEvents();
    const big = up.find((e) => e.image);
    const rest = up.filter((e) => e !== big);
    const bigHtml = big ? `
        <article class="ev-card ev-congress">
          <img src="${big.image}" alt="${esc(tr(big.alt))}" loading="lazy" width="1200" height="800" />
          <div class="ev-body">
            <p class="ev-when">${esc(eventWhen(big))}</p>
            <h3>${esc(tr(big.title))}</h3>
            <p>${esc(tf(big.note))}</p>
            ${big.link ? `<div class="btn-row"><a class="btn btn-gold" href="${link(big.link)}" ${ext}>${esc(tf(big.cta) || U.featuredCta)}</a></div>` : ""}
          </div>
        </article>` : "";
    const socialHtml = D.weekly.filter((w) => w.card).sort((a, b) => b.weekday - a.weekday).map((w) => {
      const v = D.venues[w.venue];
      const act = w.actions && w.actions[0];
      return `
        <article class="ev-card">
          <img src="${w.card.image}" alt="${esc(tr(w.card.alt))}" loading="lazy" width="720" height="360" />
          <div class="ev-body">
            <p class="ev-when">${esc(cap(frequency(w)))} · ${esc(tr(v.area))}</p>
            <h3>${esc(tr(w.title))}</h3>
            <p>${esc(tf(w.card.blurb))}</p>
            ${act ? `<a class="link" href="${link(act.link)}" ${ext}>${esc(tf(act.label))} →</a>` : `<a class="link" href="${v.map}" ${ext}>${U.directions} →</a>`}
          </div>
        </article>`;
    }).join("");
    $("ev-grid").className = `ev-grid${big ? " has-feature" : ""}`;
    $("ev-grid").innerHTML = bigHtml + socialHtml;
    $("ev-later").innerHTML = rest.map((e) => `
      <div class="save-date">
        <p class="ev-when">${esc(eventWhen(e))}</p>
        <h3>${esc(tr(e.title))}</h3>
        <p>${esc(tf(e.note))}</p>
        ${e.link ? `<a class="link" href="${link(e.link)}" ${ext}>${esc(tf(e.cta) || U.featuredCta)} →</a>` : ""}
      </div>`).join("");
    $("community-list").innerHTML = D.community.map((c) => `
      <li><span>${esc(tr(c.when))}</span> <b>${c.url ? `<a href="${c.url}" ${ext}>${esc(c.name)}</a>` : esc(c.name)}</b> · ${esc(c.city)}</li>`).join("");
  }

  /* ── weekly view ──────────────────────────────────────── */
  function renderWeekly() {
    const U = ui();
    const active = [1, 2, 3, 4, 5, 6, 0].filter((wd) => D.weekly.some((w) => w.weekday === wd));
    $("view-week").innerHTML = `<div class="week-cols" style="--cols:${active.length}">` + active.map((wd) => {
      const items = D.weekly.filter((w) => w.weekday === wd).sort((a, b) => a.start.localeCompare(b.start));
      const rule = items.find((i) => i.weeks && i.weeks.length < 5);
      return `
        <div class="wk-col">
          <h3 class="wk-day">${esc(cap(U.weekdayLong[wd]))}<small>${esc(rule ? frequency(rule) : U.weekly)}</small></h3>
          ${items.map((w) => {
            const v = D.venues[w.venue];
            const ng = w.course ? nextGroupStart(w) : null;
            const acts = w.course ? (ng ? btn(link(w.book), U.registerFor(fmtMD(ng)), "btn-red") : "") : itemActions(w);
            return `
              <article class="wk-item t-${w.type}">
                <p class="wk-time">${w.type === "free" ? `${fmtTime(w.start)} <span>${U.till} ${w.end ? fmtTime(w.end) : U.late}</span>` : fmtTimeRange(w.start, w.end)}</p>
                <h4>${esc(tr(w.title))}</h4>
                <p class="wk-venue">${esc(v.name)} · ${esc(tr(v.area))}</p>
                <p class="wk-note">${esc(tf(w.note))}</p>
                ${w.lastNote ? `<p class="wk-flag">${esc(tf(w.lastNote))}</p>` : ""}
                ${ng ? `<p class="wk-flag wk-new">${U.newGroup}: <b>${esc(fmtMD(ng))}</b></p>` : ""}
                <div class="btn-row">${acts}</div>
              </article>`;
          }).join("")}
        </div>`;
    }).join("") + `</div>`;
  }

  /* ── month view ───────────────────────────────────────── */
  let viewY = TODAY.getFullYear(), viewM = TODAY.getMonth(), selected = null;
  function firstBusyDay(from, monthEnd) {
    for (let d = from; d <= monthEnd; d = addDays(d, 1)) if (occurrencesOn(d).length) return d;
    return from;
  }
  function renderMonth() {
    const U = ui();
    const first = new Date(viewY, viewM, 1);
    const last = new Date(viewY, viewM + 1, 0);
    if (!selected || selected.getMonth() !== viewM || selected.getFullYear() !== viewY) {
      selected = firstBusyDay(TODAY > first && TODAY <= last ? TODAY : first, last);
    }
    $("m-title").textContent = cap(fmt(first, { month: "long", year: "numeric" }));
    const heads = [0, 1, 2, 3, 4, 5, 6].map((i) => `<div class="m-head" aria-hidden="true">${esc(cap(fmt(new Date(2026, 1, i + 1), { weekday: "short" })))}</div>`).join("");
    let cells = "";
    for (let i = 0; i < first.getDay(); i++) cells += `<div class="m-cell m-pad" aria-hidden="true"></div>`;
    for (let day = 1; day <= last.getDate(); day++) {
      const d = new Date(viewY, viewM, day);
      const occ = occurrencesOn(d);
      const isToday = sameDay(d, TODAY), isSel = sameDay(d, selected);
      const cls = ["m-cell", d < TODAY ? "is-past" : "", isToday ? "is-today" : "", isSel ? "is-sel" : "", occ.length ? "has" : ""].join(" ");
      const label = `${fmtLong(d)}: ${occ.length ? occ.map((o) => tr(o.item.short) + (o.cancelled ? ` (${U.closed})` : "")).join(", ") : U.nothingShort}`;
      cells += `
        <button type="button" class="${cls}" data-date="${iso(d)}" aria-pressed="${isSel}" ${isToday ? 'aria-current="date"' : ""} aria-label="${esc(label)}">
          <span class="m-num" aria-hidden="true">${day}</span>
          <span class="m-chips" aria-hidden="true">${occ.map((o) => `<span class="chip t-${o.type}${o.cancelled ? " is-closed" : ""}">${o.allDay ? "" : `<i>${fmtTime(o.start)}</i>`}${esc(tr(o.item.short))}</span>`).join("")}</span>
          <span class="m-dots" aria-hidden="true">${occ.map((o) => `<i class="t-${o.type}"></i>`).join("")}</span>
        </button>`;
    }
    $("m-grid").innerHTML = heads + cells;
    renderDayDetail();
  }
  function renderDayDetail() {
    const occ = occurrencesOn(selected);
    $("day-detail").innerHTML = `
      <h4>${esc(fmtLong(selected))}</h4>
      ${occ.length ? `<ul class="occ-list">${occ.map((o) => occCard(selected, o)).join("")}</ul>` : `<p class="muted">${ui().nothing}</p>`}`;
  }
  $("m-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-date]");
    if (!b) return;
    selected = parseISO(b.dataset.date);
    document.querySelectorAll(".m-cell.is-sel").forEach((x) => { x.classList.remove("is-sel"); x.setAttribute("aria-pressed", "false"); });
    b.classList.add("is-sel");
    b.setAttribute("aria-pressed", "true");
    renderDayDetail();
    if (window.matchMedia("(max-width: 1080px)").matches) $("day-detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  const shiftMonth = (n) => {
    const d = new Date(viewY, viewM + n, 1);
    viewY = d.getFullYear(); viewM = d.getMonth(); selected = null;
    renderMonth();
  };
  $("m-prev").addEventListener("click", () => shiftMonth(-1));
  $("m-next").addEventListener("click", () => shiftMonth(1));

  /* ── tabs (keyboard accessible) ───────────────────────── */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      selectTab(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });
  // Links marked data-open="month" jump straight to the calendar view.
  document.querySelectorAll('[data-open="month"]').forEach((a) => a.addEventListener("click", () => selectTab($("tab-month"))));

  /* ── static bits wired from data ──────────────────────── */
  function renderReviews() {
    $("reviews").innerHTML = D.reviews.map((r) => `
      <figure class="review"><blockquote>“${esc(tr(r.text))}”</blockquote>
      <figcaption><span class="stars" role="img" aria-label="${ui().fiveStars}">★★★★★</span> ${esc(r.name)} · Google</figcaption></figure>`).join("");
  }
  function wireStatic() {
    document.querySelectorAll("[data-link]").forEach((a) => { a.href = link(a.dataset.link); a.target = "_blank"; a.rel = "noopener"; });
    document.querySelectorAll("[data-venue]").forEach((el) => {
      const v = D.venues[el.dataset.venue];
      el.innerHTML = `${esc(v.street)}<br />${esc(v.cityLine)}`;
    });
    document.querySelectorAll("[data-map]").forEach((a) => { a.href = D.venues[a.dataset.map].map; a.target = "_blank"; a.rel = "noopener"; });
    const c = D.contact;
    document.querySelectorAll("[data-contact]").forEach((a) => {
      a.href = { tel: `tel:${c.phone}`, sms: `sms:${c.phone}`, email: `mailto:${c.email}` }[a.dataset.contact];
    });
  }

  /* ── language switching ───────────────────────────────── */
  const enCopy = new Map();
  document.querySelectorAll("[data-i18n],[data-i18n-html]").forEach((el) => enCopy.set(el, el.innerHTML));
  const enAttr = [];
  document.querySelectorAll("[data-i18n-aria],[data-i18n-alt]").forEach((el) => {
    if (el.dataset.i18nAria) enAttr.push([el, "aria-label", el.dataset.i18nAria, el.getAttribute("aria-label")]);
    if (el.dataset.i18nAlt) enAttr.push([el, "alt", el.dataset.i18nAlt, el.getAttribute("alt")]);
  });
  const metaDesc = document.querySelector('meta[name="description"]');
  const enMeta = { title: document.title, desc: metaDesc.content };

  function setLang(l) {
    lang = l === "es" ? "es" : "en";
    computeTokens();
    document.documentElement.lang = lang;
    enCopy.forEach((en, el) => {
      const key = el.dataset.i18n || el.dataset.i18nHtml;
      el.innerHTML = fill(lang === "es" && ES[key] ? ES[key] : en);
    });
    enAttr.forEach(([el, attr, key, en]) => el.setAttribute(attr, fill(lang === "es" && ES[key] ? ES[key] : en)));
    document.title = fill(lang === "es" ? ES["meta.title"] : enMeta.title);
    metaDesc.content = fill(lang === "es" ? ES["meta.desc"] : enMeta.desc);
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("sd-lang", lang); } catch (_) {}
    renderAll();
  }
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  function renderAll() {
    renderHero();
    renderThisWeek();
    renderFeatured();
    renderEvents();
    renderWeekly();
    renderMonth();
    renderReviews();
    wireStatic();
  }

  $("year").textContent = TODAY.getFullYear();
  let initial = params.get("lang");
  if (!initial) { try { initial = localStorage.getItem("sd-lang"); } catch (_) {} }
  if (!initial) initial = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
  setLang(initial);
})();
