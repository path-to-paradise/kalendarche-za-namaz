# Календарче за Намаз (Kalendarche za Namaz)

A Progressive Web App (PWA) that shows daily Muslim prayer (namaz) times for cities in Bulgaria, following the Bulgarian Grand Mufti's calendar and calculation method (based on the Diyanet convention).

## Features

- Prayer time tables for 48 Bulgarian towns and cities (Sofia, Plovdiv, Varna, Burgas, Ruse, and more), selectable from a dropdown.
- Swipeable, day-by-day view of a full rolling year of prayer times, powered by [Swiper](https://swiperjs.com/). A floating "Днес" button jumps back to today from anywhere.
- Shows start **and** end time for each prayer's valid window (e.g. Duha, Dhuhr, Asr), not just the start.
- Includes Духа (Duha), Витр (paired with Isha), and Техадж-джуд (Tahajjud — last third of the night), in addition to the five obligatory prayers.
- Highlights the Friday Джумая (Jumah) prayer and the current prayer interval live, with a "сега" (now) indicator that updates automatically.
- Marks the start/end of Ramadan, the day number within Ramadan, and Рамазан Байрам (Eid al-Fitr), based on officially confirmed (or best-available estimated) Bulgarian dates — see `RAMADAN_PERIODS` in `app.js`.
- Shows the weekday and "Вчера"/"Днес"/"Утре" (Yesterday/Today/Tomorrow) badges on each day.
- Dark mode and 5 accent color themes (Green, Blue, Teal, Purple, Amber), configurable from the in-app Settings panel; respects the system theme by default.
- Installable as a PWA, with an in-app install button on supported browsers and step-by-step instructions for iPhone (where no native install prompt exists).
- Offline support via a service worker: the app shell (HTML/CSS/JS) is served network-first so a new deploy is picked up immediately, while per-city time-table data uses a stale-while-revalidate cache.
- Remembers the last selected city, theme, and cookie-consent choice via `localStorage`.
- Google Analytics (GA4), loaded only after the user accepts the in-app cookie consent banner.

## Project structure

```
index.html                 Main page markup
app.js                     App logic (city selection, rendering prayer slides, themes, PWA install, consent)
style.css                  Styles, including light/dark themes and color presets
service-worker.js          PWA offline caching (network-first app shell, stale-while-revalidate data)
manifest.json              PWA manifest (icons, theme, etc.)
fallback.html              Offline fallback page
privacy-policy.html        Privacy policy page
time-table/                Per-city JSON files with yearly prayer times (e.g. sofia-time.json)
images/, images-rounded/   App icons and image assets
.claude/launch.json        Dev server config for local preview
```

## Running locally

This is a static site with no build step or dependencies. Serve the project root with any static file server, for example:

```bash
npx serve .
```

or

```bash
python3 -m http.server 8000
```

Then open the served URL in your browser.

## Updating prayer times

Each city has its own JSON file in [time-table](time-table/) (e.g. `sofia-time.json`). To update times for a new year, add/update the corresponding entries in these files. The JSON is keyed by month and day only (no year), so it's treated as reusable from year to year.

## Updating Ramadan / Eid dates

Ramadan and Eid al-Fitr depend on moon sighting and are confirmed by the Bulgarian Grand Mufti's office (via the government) shortly before each year. Add the next year's dates to the `RAMADAN_PERIODS` array near the top of `app.js` once officially announced — the app simply stops marking Ramadan/Eid once the last known year in that list has passed.

## Analytics

Google Analytics (GA4) is wired up in `app.js` (`GA_MEASUREMENT_ID`), but the tracking script is only loaded after a visitor accepts the cookie consent banner shown on first visit. Declining means the script never loads.

## Code style

This project uses [Prettier](https://prettier.io/) for formatting (see [.prettierrc](.prettierrc)).
