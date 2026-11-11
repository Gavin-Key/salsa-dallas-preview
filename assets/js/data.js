/*
 * ─────────────────────────────────────────────────────────────
 *  SALSA DALLAS: EVERYTHING THE OWNER EDITS LIVES HERE
 *
 *  Prices, the promo code, class times, which weeks a night runs,
 *  venue addresses, phone, booking links, events and closures all
 *  come from this file. The page text (English in index.html,
 *  Spanish in i18n.js) pulls them in through {{placeholders}}, so a
 *  change here updates both languages, the calendar and the hero.
 *
 *  Common edits
 *   • Change a price ............ prices.course = 85
 *   • Change the promo .......... promo.code / promo.price
 *   • Move a class time ......... weekly[…].start / end ("19:00")
 *   • Bay every Wednesday ....... remove `weeks: [1, 3]` from "bay-wed"
 *   • Cancel one night .......... add to closures (see below)
 *   • Add an event .............. add to events (past ones hide themselves)
 *
 *  Note: weekday and venue names also appear in sentences in
 *  index.html (English) and i18n.js (Spanish). If a class moves to a
 *  different DAY or VENUE, update those sentences too.
 * ─────────────────────────────────────────────────────────────
 *  weekday: 0 = Sunday … 6 = Saturday
 *  weeks:   which weeks of the month it runs (1 = first). Omit = every week.
 *  type:    "class" paid class · "free" free class + social · "event" special
 */
window.SD_DATA = {
  contact: {
    phone: "+12149239404",
    phoneDisplay: "(214) 923-9404",
    email: "Luis@SalsaDallas.com",
  },

  promo: { code: "STARTSALSA20", price: 59 },

  prices: {
    course: 79,         // 4-week beginner course
    couples: 100,       // 4-week course for two (Tuesdays)
    bachata: 79,        // monthly bachata
    unlimited: 100,     // monthly, all Tue & Thu salsa classes
    dropin: 30,         // one Int/Adv class
    private1: 110,
    privateExtra: 25,   // per extra person in a private
    private5: 450,
    privateGroup: 600,
    congressFull: 155,
  },

  venues: {
    preciosa: {
      name: "Preciosa Grill",
      area: "Carrollton",
      street: "3128 E Trinity Mills Rd",
      cityLine: "Carrollton, TX 75006",
      map: "https://www.google.com/maps/search/?api=1&query=Preciosa+Grill+3128+E+Trinity+Mills+Rd+Carrollton+TX+75006",
    },
    alexanders: {
      name: "Alexander’s Cantina & Cocina",
      area: "North Dallas",
      street: "4805 Frankford Rd, Suite 105",
      cityLine: "Dallas, TX 75287",
      map: "https://www.google.com/maps/dir/?api=1&destination=4805+Frankford+Rd+Ste+105,+Dallas,+TX+75287",
    },
    bombshells: {
      name: "Bombshells Restaurant & Bar",
      area: "Rowlett",
      street: "8524 Meigan Elise Dr",
      cityLine: "Rowlett, TX 75088",
      map: "https://www.google.com/maps/search/?api=1&query=Bombshells+8524+Meigan+Elise+Dr+Rowlett+TX+75088",
    },
    fourpoints: {
      name: "Four Points by Sheraton",
      area: { en: "Coppell, near DFW Airport", es: "Coppell, cerca del aeropuerto DFW" },
      street: "1580 Point W Blvd",
      cityLine: "Coppell, TX 75019",
      map: "https://www.google.com/maps/search/?api=1&query=Four+Points+by+Sheraton+1580+Point+W+Blvd+Coppell+TX+75019",
    },
  },

  /* Where each booking button goes (the existing salsadallas.com product pages),
     with the right day/time already selected. */
  links: {
    tue: "https://salsadallas.com/product/beginners-intro-package-4-weeks/?attribute_day=Tuesday&attribute_time=7%3A00%20PM",
    thu: "https://salsadallas.com/product/beginners-intro-package-4-weeks/?attribute_day=Thursday&attribute_time=7%3A00%20PM",
    couples: "https://salsadallas.com/product/tuesday-couples-special/?attribute_attendance-type=Couple%20%E2%80%93%20Tuesday%207%3A00%20PM%20ONLY%20-%20%24100",
    bachata: "https://salsadallas.com/product/tuesday-bachata-classes-in-addison-sept-2026-79-monthly/",
    unlimited: "https://salsadallas.com/product/unlimited-salsa-classes-dallas/",
    dropin: "https://salsadallas.com/product/individual-salsa-class/?attribute_day=Thursday&attribute_time=Thursday%20%E2%80%93%208%3A00%20PM",
    private1: "https://salsadallas.com/product/1-private-lesson/",
    private5: "https://salsadallas.com/product/5-private-lessons/",
    privateGroup: "https://salsadallas.com/product/group-private-lessons/",
    congress: "https://tickets.salsadallas.com/dsc-2026-tickets-538442",
    bay: "https://salsadallas.com/salsa-by-the-bay/",
    newsletter: "https://salsadallas.com/salsa-dallas-updates-mantente-conectado/",
  },

  weekly: [
    {
      // course: true → a new 4-week group starts the first week this runs each month
      id: "salsa-beg-tue", weekday: 2, weeks: [1, 2, 3, 4], start: "19:00", end: "20:00", type: "class",
      venue: "preciosa", course: true, book: "tue",
      short: { en: "Salsa beginners", es: "Salsa principiantes" },
      title: { en: "Salsa · Beginner course", es: "Salsa · Curso para principiantes" },
      note: { en: "4-week course · {{course}}, or {{promoPrice}} your first time", es: "Curso de 4 semanas · {{course}}, o {{promoPrice}} la primera vez" },
    },
    {
      id: "bachata-beg-tue", weekday: 2, weeks: [1, 2, 3, 4], start: "20:00", end: "21:00", type: "class",
      venue: "preciosa",
      short: { en: "Bachata", es: "Bachata" },
      title: { en: "Bachata · Beginners", es: "Bachata · Principiantes" },
      note: { en: "With Eddie & Marisela · {{bachata}}/month", es: "Con Eddie y Marisela · {{bachata}}/mes" },
      actions: [{ link: "bachata", label: { en: "Join bachata", es: "Inscribirme" } }],
    },
    {
      id: "bay-wed", weekday: 3, weeks: [1, 3], start: "20:00", end: "00:00", type: "free",
      venue: "bombshells",
      short: { en: "Free class · Rowlett", es: "Clase gratis · Rowlett" },
      title: { en: "Salsa by the Bay", es: "Salsa by the Bay" },
      note: { en: "Free class at {{bayTime}}, then dancing till midnight", es: "Clase gratis a las {{bayTime}} y baile hasta medianoche" },
      card: {
        image: "assets/img/salsa-by-the-bay.jpg",
        alt: { en: "Salsa by the Bay at Bombshells, Rowlett", es: "Salsa by the Bay en Bombshells, Rowlett" },
        blurb: {
          en: "Free class at {{bayTime}} by Lake Ray Hubbard, then salsa, bachata and merengue until midnight.",
          es: "Clase gratis a las {{bayTime}} junto al lago Ray Hubbard y luego salsa, bachata y merengue hasta medianoche.",
        },
      },
    },
    {
      id: "salsa-beg-thu", weekday: 4, weeks: [1, 2, 3, 4], start: "19:00", end: "20:00", type: "class",
      venue: "preciosa", course: true, book: "thu",
      short: { en: "Salsa beginners", es: "Salsa principiantes" },
      title: { en: "Salsa · Beginner course", es: "Salsa · Curso para principiantes" },
      note: { en: "4-week course · {{course}}, or {{promoPrice}} your first time", es: "Curso de 4 semanas · {{course}}, o {{promoPrice}} la primera vez" },
    },
    {
      id: "salsa-ia-thu", weekday: 4, weeks: [1, 2, 3, 4], start: "20:00", end: "21:00", type: "class",
      venue: "preciosa",
      short: { en: "Salsa Int/Adv", es: "Salsa Int/Av" },
      title: { en: "Salsa · Intermediate / Advanced", es: "Salsa · Intermedio / Avanzado" },
      note: { en: "Included in Unlimited ({{unlimited}}/mo) or {{dropin}} drop-in", es: "Incluido en Ilimitado ({{unlimited}}/mes) o {{dropin}} por clase" },
      actions: [
        { link: "unlimited", label: { en: "Join Unlimited", es: "Unirme a Ilimitado" } },
        { link: "dropin", label: { en: "Drop in · {{dropin}}", es: "Clase suelta · {{dropin}}" } },
      ],
    },
    {
      id: "alex-fri", weekday: 5, start: "22:30", type: "free",   // no `end`: the site only says "until late"
      lastOfMonthStart: "21:00",
      venue: "alexanders",
      short: { en: "Free class · Alexander’s", es: "Clase gratis · Alexander’s" },
      title: { en: "Salsa Friday at Alexander’s", es: "Viernes de Salsa en Alexander’s" },
      note: {
        en: "Free class, then live band (Rodrigo Mondragón) + DJ Ruben Reyes",
        es: "Clase gratis y luego orquesta en vivo (Rodrigo Mondragón) + DJ Ruben Reyes",
      },
      lastNote: { en: "Last Friday of the month: class at {{friLastTime}}", es: "Último viernes del mes: clase a las {{friLastTime}}" },
      card: {
        image: "assets/img/social-night.jpg",
        alt: { en: "Dancers at a Salsa Dallas social night", es: "Bailarines en una noche social de Salsa Dallas" },
        blurb: {
          en: "Free beginner class with Luis at {{friTime}} ({{friLastTime}} on the last Friday of the month), then live music from Rodrigo Mondragón and DJ Ruben Reyes.",
          es: "Clase gratis para principiantes con Luis a las {{friTime}} ({{friLastTime}} el último viernes del mes) y luego música en vivo con Rodrigo Mondragón y DJ Ruben Reyes.",
        },
      },
    },
  ],

  /* One-off events. They appear in the calendar and Events section,
     and disappear automatically after their end date. */
  events: [
    {
      id: "dsc-2026", start: "2026-11-20", end: "2026-11-22", type: "event",
      venue: "fourpoints", link: "congress", featured: true,
      image: "assets/img/DSC2026main.jpg",
      logo: "assets/img/dsc_logo_hat_2026_small.png",
      alt: { en: "Packed ballroom at the Dallas Salsa Congress", es: "Salón lleno en el Dallas Salsa Congress" },
      short: { en: "Salsa Congress", es: "Salsa Congress" },
      title: { en: "Dallas Salsa Congress 2026", es: "Dallas Salsa Congress 2026" },
      note: {
        en: "The 16th annual weekend: workshops, world-class shows, and social dancing until 3 AM Friday and Saturday.",
        es: "La 16ª edición: talleres, shows de nivel mundial y baile social hasta las 3 AM viernes y sábado.",
      },
      cta: { en: "Full Pass {{congressFull}} · night passes too", es: "Full Pass {{congressFull}} · también pases por noche" },
    },
    {
      // Source: shop.salsadallas.com ("Bachatéame Congress 2027 · April 9–11, 2027")
      id: "bachateame-2027", start: "2027-04-09", end: "2027-04-11", type: "event",
      short: { en: "Bachatéame", es: "Bachatéame" },
      title: { en: "Bachatéame Congress 2027", es: "Bachatéame Congress 2027" },
      note: { en: "Save the date. Tickets coming soon.", es: "Reserva la fecha. Boletos próximamente." },
    },
  ],

  /* Exceptions to the weekly rules for a single date.
     status "cancelled" → struck through, no booking.
     status "confirm"   → still shown, with your note as a warning badge (use for holidays you haven't decided).
     ids: which weekly items it applies to (omit = all that night). */
  closures: [
    { date: "2026-11-20", ids: ["alex-fri"], status: "confirm", note: { en: "Congress weekend: check before you come", es: "Fin de semana del Congress: confirma antes de venir" } },
    { date: "2026-11-26", ids: ["salsa-beg-thu", "salsa-ia-thu"], status: "confirm", note: { en: "Thanksgiving: check before you come", es: "Acción de Gracias: confirma antes de venir" } },
    { date: "2026-12-24", ids: ["salsa-beg-thu", "salsa-ia-thu"], status: "confirm", note: { en: "Christmas Eve: check before you come", es: "Nochebuena: confirma antes de venir" } },
    { date: "2026-12-25", ids: ["alex-fri"], status: "confirm", note: { en: "Christmas Day: check before you come", es: "Navidad: confirma antes de venir" } },
    { date: "2027-01-01", ids: ["alex-fri"], status: "confirm", note: { en: "New Year’s Day: check before you come", es: "Año Nuevo: confirma antes de venir" } },
  ],

  reviews: [
    { name: "Christine A.", text: { en: "Such a fun class! Great people, music and vibes! I signed up for another month!", es: "¡Una clase muy divertida! Buena gente, música y ambiente. ¡Me inscribí otro mes!" } },
    { name: "Priya P.", text: { en: "I was feeling incredibly rusty and nervous to dance again. Luis made it comfortable to re-learn the basics and quickly get back into patterns.", es: "Me sentía oxidada y nerviosa de volver a bailar. Luis hizo que fuera cómodo reaprender lo básico y volver rápido a las combinaciones." } },
    { name: "Aldo S.", text: { en: "Luis taught me how to dance from zero. Patient and fun.", es: "Luis me enseñó a bailar desde cero. Paciente y divertido." } },
    { name: "Danièle N.", text: { en: "So good at explaining, I could correct my posture and be comfortable with someone leading. Can’t wait to come back.", es: "Explican muy bien; pude corregir mi postura y sentirme cómoda siguiendo. ¡Quiero volver!" } },
  ],

  community: [
    { when: { en: "1st Friday", es: "1er viernes" }, name: "Échale Salsita", city: "Dallas" },
    { when: { en: "2nd Friday", es: "2º viernes" }, name: "Salsón Social", city: "Addison" },
    { when: { en: "3rd Friday", es: "3er viernes" }, name: "Pura Fort Worth", city: "Fort Worth", url: "https://www.facebook.com/puraftworth/" },
  ],
};
