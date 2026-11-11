/*
 * ─────────────────────────────────────────────────────────────
 *  SALSA DALLAS — SINGLE SOURCE OF TRUTH
 *  Every date, time, price and link on the site comes from this
 *  file. Change it here and the hero, weekly schedule, calendar,
 *  "this week" strip and pricing all update together.
 * ─────────────────────────────────────────────────────────────
 *  weekday: 0 = Sunday … 6 = Saturday
 *  type:    "class"  → paid class (course / membership)
 *           "free"   → free beginner class + social dancing
 *           "event"  → congress, workshop, special night
 */
window.SD_DATA = {
  contact: {
    phone: "+12149239404",
    phoneDisplay: "(214) 923-9404",
    email: "Luis@SalsaDallas.com",
    newsletter: "https://salsadallas.com/salsa-dallas-updates-mantente-conectado/",
    social: {
      instagram: "https://www.instagram.com/salsadallas",
      facebook: "https://www.facebook.com/SalsaDallas/",
      youtube: "https://www.youtube.com/salsadallas",
      tiktok: "https://www.tiktok.com/@salsadallas",
    },
  },

  promo: { code: "STARTSALSA20", price: 59, regular: 79 },

  venues: {
    preciosa: {
      name: "Preciosa Grill",
      city: "Carrollton",
      address: "3128 E Trinity Mills Rd, Carrollton, TX 75006",
      map: "https://www.google.com/maps/search/?api=1&query=Preciosa+Grill+3128+E+Trinity+Mills+Rd+Carrollton+TX+75006",
    },
    alexanders: {
      name: "Alexander’s Cantina & Cocina",
      city: "North Dallas",
      address: "4805 Frankford Rd, Suite 105, Dallas, TX 75287",
      map: "https://www.google.com/maps/dir/?api=1&destination=4805+Frankford+Rd+Ste+105,+Dallas,+TX+75287",
    },
    bombshells: {
      name: "Bombshells Restaurant & Bar",
      city: "Rowlett",
      address: "8524 Meigan Elise Dr, Rowlett, TX 75088",
      map: "https://www.google.com/maps/search/?api=1&query=Bombshells+8524+Meigan+Elise+Dr+Rowlett+TX+75088",
    },
    coppell: {
      name: "Four Points by Sheraton",
      city: "Coppell (near DFW Airport)",
      address: "Coppell, TX",
      map: "https://www.google.com/maps/search/?api=1&query=Four+Points+by+Sheraton+Coppell+TX",
    },
  },

  /* Where each "Register" button goes (the existing salsadallas.com checkout). */
  links: {
    tue: "https://salsadallas.com/product/beginners-intro-package-4-weeks/?attribute_day=Tuesday",
    thu: "https://salsadallas.com/product/beginners-intro-package-4-weeks/?attribute_day=Thursday",
    couples: "https://salsadallas.com/product/tuesday-couples-special/",
    bachata: "https://salsadallas.com/product/tuesday-bachata-classes-in-addison-sept-2026-79-monthly/",
    unlimited: "https://salsadallas.com/product/unlimited-salsa-classes-dallas/",
    dropin: "https://salsadallas.com/product/individual-salsa-class/",
    private1: "https://salsadallas.com/product/1-private-lesson/",
    private5: "https://salsadallas.com/product/5-private-lessons/",
    privateGroup: "https://salsadallas.com/product/group-private-lessons/",
    congress: "https://tickets.salsadallas.com/dsc-2026-tickets-538442",
    bay: "https://salsadallas.com/salsa-by-the-bay/",
  },

  /* Monthly beginner groups start on the FIRST <weekday> of each month. */
  courseStarts: [
    { weekday: 2, link: "tue" },
    { weekday: 4, link: "thu" },
  ],

  weekly: [
    {
      id: "salsa-beg-tue", weekday: 2, start: "19:00", end: "20:00", type: "class",
      venue: "preciosa", level: "beginner", course: true, book: "tue",
      short: { en: "Salsa beginners", es: "Salsa principiantes" },
      title: { en: "Salsa · Beginner course", es: "Salsa · Curso principiante" },
      note: { en: "4-week course, new group every month", es: "Curso de 4 semanas, nuevo grupo cada mes" },
    },
    {
      id: "bachata-beg-tue", weekday: 2, start: "20:00", end: "21:00", type: "class",
      venue: "preciosa", level: "beginner", book: "bachata",
      short: { en: "Bachata", es: "Bachata" },
      title: { en: "Bachata · Beginners", es: "Bachata · Principiantes" },
      note: { en: "With Eddie & Marisela · $79/month", es: "Con Eddie y Marisela · $79/mes" },
    },
    {
      id: "bay-wed", weekday: 3, weeks: [1, 3], start: "20:00", end: "00:00", type: "free",
      venue: "bombshells", level: "all", book: "bay",
      short: { en: "Free class · Rowlett", es: "Clase gratis · Rowlett" },
      title: { en: "Salsa by the Bay", es: "Salsa by the Bay" },
      note: { en: "Free class at 8 PM, then dancing till midnight", es: "Clase gratis a las 8 PM y baile hasta medianoche" },
    },
    {
      id: "salsa-beg-thu", weekday: 4, start: "19:00", end: "20:00", type: "class",
      venue: "preciosa", level: "beginner", course: true, book: "thu",
      short: { en: "Salsa beginners", es: "Salsa principiantes" },
      title: { en: "Salsa · Beginner course", es: "Salsa · Curso principiante" },
      note: { en: "4-week course, new group every month", es: "Curso de 4 semanas, nuevo grupo cada mes" },
    },
    {
      id: "salsa-ia-thu", weekday: 4, start: "20:00", end: "21:00", type: "class",
      venue: "preciosa", level: "intermediate", book: "unlimited",
      short: { en: "Salsa Int/Adv", es: "Salsa Int/Av" },
      title: { en: "Salsa · Intermediate / Advanced", es: "Salsa · Intermedio / Avanzado" },
      note: { en: "Included in Unlimited · or $30 drop-in", es: "Incluido en Ilimitado · o $30 clase suelta" },
    },
    {
      id: "alex-fri", weekday: 5, start: "22:30", end: "02:00", type: "free",
      lastOfMonthStart: "21:00",
      venue: "alexanders", level: "all",
      short: { en: "Free class · Alexander’s", es: "Clase gratis · Alexander’s" },
      title: { en: "Salsa Friday at Alexander’s", es: "Viernes de Salsa en Alexander’s" },
      note: {
        en: "Free class, live band (Rodrigo Mondragón) + DJ Ruben Reyes",
        es: "Clase gratis, orquesta en vivo (Rodrigo Mondragón) + DJ Ruben Reyes",
      },
      lastNote: { en: "Last Friday of the month: class moves to 9 PM", es: "Último viernes del mes: la clase es a las 9 PM" },
    },
  ],

  events: [
    {
      id: "dsc-2026", start: "2026-11-20", end: "2026-11-22", type: "event",
      venue: "coppell", url: "congress", featured: true,
      short: { en: "Salsa Congress", es: "Salsa Congress" },
      title: { en: "Dallas Salsa Congress 2026", es: "Dallas Salsa Congress 2026" },
      note: {
        en: "16th annual · 3 days of workshops, world-class shows, social dancing till 3 AM",
        es: "16ª edición · 3 días de talleres, shows de nivel mundial y baile social hasta las 3 AM",
      },
    },
    {
      id: "bachateame-2027", start: "2027-04-09", end: "2027-04-11", type: "event",
      venue: null,
      short: { en: "Bachatéame", es: "Bachatéame" },
      title: { en: "Bachatéame Congress 2027", es: "Bachatéame Congress 2027" },
      note: { en: "Save the date — tickets coming soon", es: "Reserva la fecha — boletos próximamente" },
    },
  ],

  /* Cancel or change a single date without touching the weekly rules, e.g.
     { date: "2026-11-26", ids: ["salsa-beg-thu", "salsa-ia-thu"], note: { en: "No class — Thanksgiving", es: "Sin clase — Día de Acción de Gracias" } } */
  closures: [],

  prices: {
    course: 79,
    couples: 100,
    bachata: 79,
    unlimited: 100,
    dropin: 30,
    private1: 110,
    private5: 450,
    privateGroup: 600,
    congressFull: 155,
  },

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
