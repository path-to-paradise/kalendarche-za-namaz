# Календарче за Намаз (Kalendarche za Namaz)

A lightweight Progressive Web App (PWA) that shows daily Muslim prayer (namaz) times for cities in Bulgaria.

## Features

- Prayer time tables for 48 Bulgarian towns and cities (Sofia, Plovdiv, Varna, Burgas, Ruse, and more), selectable from a dropdown.
- Swipeable, day-by-day view of prayer times powered by [Swiper](https://swiperjs.com/).
- Remembers the last selected city via `localStorage`.
- Installable as a PWA with offline support via a service worker.
- Includes a Jummah (Friday prayer) time in the schedule.

## Project structure

```
index.html                 Main page markup
index-02-01-2026-1.js      App logic (city selection, rendering prayer slides)
style.css                  Styles
service-worker.js          PWA offline caching
manifest.json              PWA manifest (icons, theme, etc.)
fallback.html              Offline fallback page
privacy-policy.html        Privacy policy page
time-table/                Per-city JSON files with yearly prayer times (e.g. sofia-time.json)
images/, images-rounded/   App icons and image assets
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

Each city has its own JSON file in [time-table](time-table/) (e.g. `sofia-time.json`). To update times for a new year, add/update the corresponding entries in these files.

## Code style

This project uses [Prettier](https://prettier.io/) for formatting (see [.prettierrc](.prettierrc)).
