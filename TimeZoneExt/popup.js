// Maps timezone abbreviations to their UTC offset.
// Keys with duplicate abbreviations (e.g. BST, CST) are suffixed to avoid collisions:
//   BST-L = British Summer Time (London), BST-D = Bangladesh Standard Time (Dhaka)
//   CST-B = China Standard Time (Beijing), CST-G = Central Standard Time (Guatemala)
// Entries with a `minutes` field are zones that sit at a non-whole-hour offset (e.g. IST = UTC+5:30).
const TIMEZONE_OFFSETS = {
  LINT: { hours: 14 },
  TOT: { hours: 13 },
  CHAST: { hours: 12, minutes: 45 },
  ANAT: { hours: 12 },
  SBT: { hours: 11 },
  LHST: { hours: 10, minutes: 30 },
  AEST: { hours: 10 },
  ACST: { hours: 9, minutes: 30 },
  JST: { hours: 9 },
  ACWST: { hours: 8, minutes: 45 },
  "CST-B": { hours: 8 },
  WIB: { hours: 7 },
  MMT: { hours: 6, minutes: 30 },
  "BST-D": { hours: 6 },
  NPT: { hours: 5, minutes: 45 },
  IST: { hours: 5, minutes: 30 },
  UZT: { hours: 5 },
  IRDT: { hours: 4, minutes: 30 },
  GST: { hours: 4 },
  MSK: { hours: 3 },
  CEST: { hours: 2 },
  "BST-L": { hours: 1 },
  GMT: { hours: 0 },
  CVT: { hours: -1 },
  WGST: { hours: -2 },
  NDT: { hours: -2, minutes: 30 },
  ART: { hours: -3 },
  EDT: { hours: -4 },
  CDT: { hours: -5 },
  "CST-G": { hours: -6 },
  PDT: { hours: -7 },
  AKDT: { hours: -8 },
  MART: { hours: -9, minutes: 30 },
  HDT: { hours: -9 },
  HST: { hours: -10 },
  NUT: { hours: -11 },
  AoE: { hours: -12 },
};

// Thin wrapper around chrome.storage.sync that falls back to localStorage
// when running outside the extension context (e.g. opening popup.html directly in a browser tab for testing).
const storage = {
  get: (key, cb) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.get([key], (result) => cb(result[key]));
    } else {
      cb(localStorage.getItem(key));
    }
  },
  set: (key, value) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ [key]: value });
    } else {
      localStorage.setItem(key, value);
    }
  },
};

// Returns the current time { h, m, s } in the given timezone.
// All math is done in UTC milliseconds to avoid interference from the browser's local timezone:
//   1. Get current UTC time in ms
//   2. Add the target zone's offset in ms
//   3. Construct a new Date from that adjusted timestamp and read its local h/m/s
// 'AUTO' and any unrecognized key fall back to the browser's local time.
function getTimeForZone(zoneKey) {
  const now = new Date();
  if (zoneKey === "AUTO" || !TIMEZONE_OFFSETS[zoneKey]) {
    return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
  }
  const off = TIMEZONE_OFFSETS[zoneKey];
  const offsetMs = (off.hours * 60 + (off.minutes ?? 0)) * 60 * 1000;
  const zoneDate = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + offsetMs,
  );
  return {
    h: zoneDate.getHours(),
    m: zoneDate.getMinutes(),
    s: zoneDate.getSeconds(),
  };
}

// Converts a 24h hour value to 12h format.
// The `|| 12` handles midnight (0 % 12 === 0, which should display as 12, not 0).
function to12Hour(h24) {
  return { h12: h24 % 12 || 12, period: h24 >= 12 ? "PM" : "AM" };
}

// Zero-pads a number to 2 digits so times like 9:05 don't show as 9:5.
const pad = (n) => String(n).padStart(2, "0");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// DOM references cached once at startup rather than queried on every tick.
const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");
const selectEl = document.getElementById("timeZone");
const themeBtn = document.getElementById("themeBtn");

// Called every second via setInterval. Reads the current zone from the dropdown,
// computes the time, and writes it to the DOM.
function updateClock() {
  const { h, m, s } = getTimeForZone(selectEl.value);
  const { h12, period } = to12Hour(h);
  timeEl.textContent = `${h12}:${pad(m)}:${pad(s)}`;
  periodEl.textContent = period;
  const now = new Date();
  dateEl.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

// Persists the newly selected zone and immediately refreshes the clock
// so the user doesn't have to wait up to 1s for the next tick.
function onZoneChange() {
  storage.set("choice", selectEl.value);
  updateClock();
}

// Applies a theme by toggling the 'night' class on <body> (all color changes
// are handled in CSS via the body.night selector) and updates the button icon.
function applyTheme(theme) {
  const isNight = theme === "night";
  document.body.classList.toggle("night", isNight);
  themeBtn.textContent = isNight ? "🌙" : "☀️";
}

// Flips the current theme, persists the choice, and applies it.
function onThemeToggle() {
  const next = document.body.classList.contains("night") ? "day" : "night";
  applyTheme(next);
  storage.set("theme", next);
}

themeBtn.addEventListener("click", onThemeToggle);

// ── Init ──
// Theme is restored first so there's no flash of the wrong theme before the clock loads.
storage.get("theme", (savedTheme) => {
  applyTheme(savedTheme ?? "day");
});

// Restore the last selected timezone, defaulting to AUTO on first run.
// The interval starts here rather than at the top level so the clock doesn't
// tick before the saved zone has been restored from storage.
storage.get("choice", (saved) => {
  if (saved && selectEl.querySelector(`option[value="${saved}"]`)) {
    selectEl.value = saved;
  } else {
    selectEl.value = "AUTO";
  }
  updateClock();
  setInterval(updateClock, 1000);
});

selectEl.addEventListener("change", onZoneChange);
