const PRAYER_ICONS = {
    fajr: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 14.6A7 7 0 1 1 9 6a5.7 5.7 0 0 0 8.5 8.6Z"/><path d="M19 3v2.4M17.8 4.2h2.4"/></svg>',
    sunrise: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h18M8 17a4 4 0 0 1 8 0"/><path d="M12 3v3.4"/><path d="M9.5 8.4 12 6l2.5 2.4" stroke-width="1.5"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.2M12 19v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.8 12h2.2M19 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    sunset: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h18M8 17a4 4 0 0 1 8 0"/><path d="M12 3v3.4"/><path d="M9.5 5 12 7.4 14.5 5" stroke-width="1.5"/></svg>',
    isha: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
    duha: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="3.6"/><path d="M12 6v2M6.5 9.5l1.4 1.4M17.5 9.5l-1.4 1.4M3.5 17h17"/></svg>',
    tehajjud: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 14.3A6.6 6.6 0 1 1 9 4.3a5.4 5.4 0 0 0 7.5 10Z"/><path d="M19 3v2.2M17.9 4.1h2.2M6 15.5v1.8M5.1 16.4h1.8"/></svg>'
};

// Ramadan and Eid al-Fitr (Рамазан Байрам) dates depend on moon sighting and
// are announced by the Bulgarian Grand Mufti's office (confirmed by the
// government) shortly before each year. Add next year's entry once it is
// officially announced — until then the app simply stops showing a
// Ramadan/Eid marker or countdown past the last known year.
const RAMADAN_PERIODS = [
    {
        // Ramadan 1446 AH — official Bulgarian dates
        start: new Date(2025, 2, 1),
        end: new Date(2025, 2, 30),
        eidStart: new Date(2025, 2, 31),
        eidDays: 2
    },
    {
        // Ramadan 1447 AH — official Bulgarian dates
        start: new Date(2026, 1, 18),
        end: new Date(2026, 2, 18),
        eidStart: new Date(2026, 2, 19),
        eidDays: 2
    },
    {
        // Ramadan 1448 AH — estimated, pending official confirmation
        start: new Date(2027, 1, 8),
        end: new Date(2027, 2, 9),
        eidStart: new Date(2027, 2, 10),
        eidDays: 2
    }
];

function getDaysBetween(fromDate, toDate) {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Math.round((toDate.getTime() - fromDate.getTime()) / oneDayInMs);
}

function getRamadanPeriod(fullDate) {
    return RAMADAN_PERIODS.find(
        (period) => fullDate >= period.start && fullDate <= period.end
    );
}

function getEidInfo(fullDate) {
    for (const period of RAMADAN_PERIODS) {
        const dayOffset = getDaysBetween(period.eidStart, fullDate);
        if (dayOffset >= 0 && dayOffset < period.eidDays) {
            return { dayNumber: dayOffset + 1 };
        }
    }

    return null;
}

function getRamadanBannerHtml(fullDate) {
    const eidInfo = getEidInfo(fullDate);
    if (eidInfo) {
        const label =
            eidInfo.dayNumber === 1
                ? 'Рамазан Байрам'
                : 'Втори ден на Рамазан Байрам';
        return `<div class="eid-banner">${label}</div>`;
    }

    const ramadanPeriod = getRamadanPeriod(fullDate);
    if (ramadanPeriod) {
        const dayNumber = getDaysBetween(ramadanPeriod.start, fullDate) + 1;
        const totalDays = getDaysBetween(ramadanPeriod.start, ramadanPeriod.end) + 1;

        let label = `${dayNumber}-и ден от Рамазан`;
        if (dayNumber === 1) {
            label = 'Начало на Рамазан';
        } else if (dayNumber === totalDays) {
            label = `Последен ден от Рамазан · ${label}`;
        }

        return `<div class="ramadan-banner">${label}</div>`;
    }

    return '';
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.error('service worker not registered', err));
}

function isRunningAsInstalledApp() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}

function isIosDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function setupInstallPrompt() {
    const installButton = document.querySelector('#install-button');

    if (!installButton || isRunningAsInstalledApp()) {
        return;
    }

    if (isIosDevice()) {
        const iosInstructions = document.querySelector(
            '#ios-install-instructions'
        );
        const closeButton = iosInstructions?.querySelector(
            '.modal__close'
        );

        installButton.hidden = false;
        installButton.addEventListener('click', () => {
            iosInstructions.hidden = false;
        });
        closeButton?.addEventListener('click', () => {
            iosInstructions.hidden = true;
        });
        iosInstructions?.addEventListener('click', (event) => {
            if (event.target === iosInstructions) {
                iosInstructions.hidden = true;
            }
        });
        return;
    }

    let deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        installButton.hidden = false;
    });

    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            return;
        }
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installButton.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
        installButton.hidden = true;
        deferredInstallPrompt = null;
    });
}

const THEME_MODE_STORAGE_KEY = 'themeMode';
const COLOR_THEME_STORAGE_KEY = 'colorTheme';

function resolveThemeMode(mode) {
    if (mode === 'system') {
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
        ).matches;
        return prefersDark ? 'dark' : 'light';
    }
    return mode;
}

function applyThemeMode(mode) {
    document.documentElement.setAttribute('data-theme', resolveThemeMode(mode));
}

function applyColorTheme(colorTheme) {
    if (colorTheme && colorTheme !== 'green') {
        document.documentElement.setAttribute('data-color-theme', colorTheme);
    } else {
        document.documentElement.removeAttribute('data-color-theme');
    }
}

function setupThemeSettings() {
    const settingsButton = document.querySelector('#settings-button');
    const settingsModal = document.querySelector('#settings-modal');
    const closeButton = settingsModal?.querySelector('.modal__close');
    const themeButtons = settingsModal?.querySelectorAll('[data-theme-mode]');
    const colorButtons = settingsModal?.querySelectorAll(
        '[data-color-theme-option]'
    );

    let themeMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) || 'system';
    let colorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY) || 'green';

    const updateActiveButtons = () => {
        themeButtons?.forEach((button) => {
            button.classList.toggle(
                'is-active',
                button.dataset.themeMode === themeMode
            );
        });
        colorButtons?.forEach((button) => {
            button.classList.toggle(
                'is-active',
                button.dataset.colorThemeOption === colorTheme
            );
        });
    };

    applyThemeMode(themeMode);
    applyColorTheme(colorTheme);
    updateActiveButtons();

    settingsButton?.addEventListener('click', () => {
        settingsModal.hidden = false;
    });
    closeButton?.addEventListener('click', () => {
        settingsModal.hidden = true;
    });
    settingsModal?.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.hidden = true;
        }
    });

    themeButtons?.forEach((button) => {
        button.addEventListener('click', () => {
            themeMode = button.dataset.themeMode;
            localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
            applyThemeMode(themeMode);
            updateActiveButtons();
        });
    });

    colorButtons?.forEach((button) => {
        button.addEventListener('click', () => {
            colorTheme = button.dataset.colorThemeOption;
            localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
            applyColorTheme(colorTheme);
            updateActiveButtons();
        });
    });

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
            if (themeMode === 'system') {
                applyThemeMode(themeMode);
            }
        });
}

const GA_MEASUREMENT_ID = 'G-NPSE0CR3QK';
const COOKIE_CONSENT_STORAGE_KEY = 'cookieConsent';

function loadGoogleAnalytics() {
    if (window.dataLayer) {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
}

function setupCookieConsent() {
    const banner = document.querySelector('#cookie-banner');
    const acceptButton = document.querySelector('#cookie-accept');
    const declineButton = document.querySelector('#cookie-decline');
    const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (consent === 'granted') {
        loadGoogleAnalytics();
        return;
    }
    if (consent === 'denied' || !banner) {
        return;
    }

    banner.hidden = false;

    acceptButton?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'granted');
        banner.hidden = true;
        loadGoogleAnalytics();
    });

    declineButton?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'denied');
        banner.hidden = true;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    setupInstallPrompt();
    setupThemeSettings();
    setupCookieConsent();

    let selectedCity = localStorage.getItem('selectedCity');
    const selectedCityElement = document.querySelector('#selected-city');

    if (!selectedCity) {
        selectedCity =
            selectedCityElement.options[selectedCityElement.selectedIndex]
                .value;
    }

    selectedCityElement.value = selectedCity;

    const prayerTimeTable = await getTimeForSelectedCity(selectedCity);

    const swiperInstance = new Swiper('#swiper', {
        direction: 'vertical',
        scrollbar: {
            draggable: true,
            el: '.swiper-scrollbar'
        },
        mousewheel: true
    });

    const todayButton = document.querySelector('#today-button');
    swiperInstance.on('slideChange', () => {
        todayButton.hidden = swiperInstance.activeIndex === TODAY_SLIDE_INDEX;
    });
    todayButton.addEventListener('click', () => {
        swiperInstance.slideTo(TODAY_SLIDE_INDEX);
    });

    selectedCityElement.addEventListener('change', (event) =>
        changeTimeToSelectedCity(event, swiperInstance)
    );
    renderPrayerSlides(prayerTimeTable, swiperInstance);

    setInterval(updateCurrentPrayerHighlight, 30000);
});

async function changeTimeToSelectedCity(event, swiperInstance) {
    const element = event.target;
    const selectedCity = element.options[element.selectedIndex].value;
    localStorage.setItem('selectedCity', selectedCity);

    const prayerTimeTable = await getTimeForSelectedCity(selectedCity);

    swiperInstance.removeAllSlides();
    renderPrayerSlides(prayerTimeTable, swiperInstance);
}

// Rendering always starts at yesterday, so today is always the 2nd slide.
const TODAY_SLIDE_INDEX = 1;

function renderPrayerSlides(allNamazForThisYear, swiperInstance) {
    let currentFullDate = new Date();
    currentFullDate.setHours(0, 0, 0, 0);
    currentFullDate.setDate(currentFullDate.getDate() - 1);

    const oneYearFromNow = new Date(currentFullDate);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    while (currentFullDate < oneYearFromNow) {
        // Month is zero-indexed so we have to add 1 to get the current month
        // For example: January is 0, February is 1, etc.
        const currentMonth = currentFullDate.getMonth() + 1;
        const currentDate = currentFullDate.getDate();
        const allNamazForCurrentMonth = allNamazForThisYear[currentMonth];
        const allNamazForCurrentDay = allNamazForCurrentMonth[currentDate];

        const nextFullDate = new Date(currentFullDate);
        nextFullDate.setDate(currentDate + 1);
        const nextDate = nextFullDate.getDate();
        const nextMonth = nextFullDate.getMonth() + 1;
        const allNamazForNextMonth = allNamazForThisYear[nextMonth];
        const allNamazForTheNextDay = allNamazForNextMonth[nextDate];

        const tehajjudPrayerTime = calculateTehajjudPrayer(
            allNamazForCurrentDay.maghrib,
            allNamazForTheNextDay.down
        );
        allNamazForCurrentDay.tehajjud = tehajjudPrayerTime;

        const slideTemplate = getPrayerTemplate(
            allNamazForCurrentDay,
            currentFullDate,
            allNamazForTheNextDay.down
        );
        swiperInstance.appendSlide(slideTemplate);

        currentFullDate = getNextDate(currentFullDate, 1);
    }

    swiperInstance.slideTo(TODAY_SLIDE_INDEX);
    updateCurrentPrayerHighlight();
}

function updateCurrentPrayerHighlight() {
    const now = new Date();
    let currentRow = null;

    document.querySelectorAll('.prayer[data-start]').forEach((row) => {
        const start = new Date(row.dataset.start);
        const end = new Date(row.dataset.end);
        if (now >= start && now < end) {
            currentRow = row;
        }
    });

    document.querySelectorAll('.prayer--current').forEach((row) => {
        if (row !== currentRow) {
            row.classList.remove('prayer--current');
        }
    });

    currentRow?.classList.add('prayer--current');
}

async function getTimeForSelectedCity(selectedCity) {
    const response = await fetch(`/time-table/${selectedCity}-time.json`);
    const prayerTimeTable = await response.json();

    return prayerTimeTable;
}

function getNextDate(currentUserDate, daysLater) {
    const currentDate = currentUserDate.getDate();
    const nextDateAsTimeStamp = currentUserDate.setDate(
        currentDate + daysLater
    );
    const fullDate = new Date(nextDateAsTimeStamp);
    return fullDate;
}

function timeStringToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTimeString(totalMinutes) {
    const normalizedMinutes =
        ((Math.round(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;

    return `${hours}:${String(minutes).padStart(2, '0')}`;
}

function addMinutesToTimeString(timeString, minutesToAdd) {
    return minutesToTimeString(timeStringToMinutes(timeString) + minutesToAdd);
}

// Duha begins once the sun has fully risen. Bulgaria follows the Diyanet
// (Turkish) tradition, which places this ~45 minutes after sunrise.
const DUHA_MINUTES_AFTER_SUNRISE = 45;

function calculateTehajjudPrayer(maghribPrayerTime, nextDayFajrPrayerTime) {
    if (!maghribPrayerTime || !nextDayFajrPrayerTime) {
        return 'липсва';
    }

    const maghribInMinutes = timeStringToMinutes(maghribPrayerTime);
    const nextDayFajrInMinutes =
        timeStringToMinutes(nextDayFajrPrayerTime) + 24 * 60;

    const nightDurationInMinutes = nextDayFajrInMinutes - maghribInMinutes;
    const lastThirdOfTheNightStartsAtInMinutes =
        nextDayFajrInMinutes - nightDurationInMinutes / 3;

    return minutesToTimeString(lastThirdOfTheNightStartsAtInMinutes);
}

function isSameDay(dateA, dateB) {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}

function getRelativeDate(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
}

function isToday(dateToBeCompared) {
    return isSameDay(dateToBeCompared, new Date());
}

function isYesterday(dateToBeCompared) {
    return isSameDay(dateToBeCompared, getRelativeDate(-1));
}

function isTomorrow(dateToBeCompared) {
    return isSameDay(dateToBeCompared, getRelativeDate(1));
}

function getTimeRangeHtml(startTime, endTime) {
    if (!endTime || !startTime?.includes(':')) {
        return `<span class="time">${startTime}</span>`;
    }

    return `<span class="time">${startTime}<span class="time-end"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>${endTime}</span></span>`;
}

function getTimeWithLabelHtml(time, label) {
    return `<span class="time">${time}<span class="time-end">${label}</span></span>`;
}

function combineDateAndTime(date, timeString) {
    if (!timeString?.includes(':')) {
        return null;
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
}

function getIntervalAttrs(startDate, endDate) {
    if (!startDate || !endDate) {
        return '';
    }

    return ` data-start="${startDate.toISOString()}" data-end="${endDate.toISOString()}"`;
}

const NOW_BADGE_HTML = '<span class="now-badge">сега</span>';

function getIconBadge(iconSvg) {
    return `<span class="icon-badge">${iconSvg}</span>`;
}

function getPrayerTemplate(prayerTimes, fullDate, nextDayFajr) {
    const { down, sunrise, dhuhr, asr, maghrib, isha, tehajjud } = prayerTimes;

    const date = fullDate.getDate();
    const month = fullDate.toLocaleString('bg', { month: 'long' });
    const year = fullDate.getFullYear();
    const weekday = fullDate.toLocaleString('bg', { weekday: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    let dayBadge = '';
    if (isToday(fullDate)) {
        dayBadge = '<span class="day-badge day-badge--today">Днес</span>';
    } else if (isYesterday(fullDate)) {
        dayBadge = '<span class="day-badge">Вчера</span>';
    } else if (isTomorrow(fullDate)) {
        dayBadge = '<span class="day-badge">Утре</span>';
    }

    const ramadanBanner = getRamadanBannerHtml(fullDate);

    const isFriday = fullDate.getDay() === 5;
    const duha = addMinutesToTimeString(sunrise, DUHA_MINUTES_AFTER_SUNRISE);

    const nextCalendarDay = new Date(fullDate);
    nextCalendarDay.setDate(nextCalendarDay.getDate() + 1);
    const nextDayFajrDate = combineDateAndTime(nextCalendarDay, nextDayFajr);

    const fajrInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, down),
        combineDateAndTime(fullDate, sunrise)
    );
    const duhaInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, duha),
        combineDateAndTime(fullDate, dhuhr)
    );
    const dhuhrInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, dhuhr),
        combineDateAndTime(fullDate, asr)
    );
    const asrInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, asr),
        combineDateAndTime(fullDate, maghrib)
    );
    const maghribInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, maghrib),
        combineDateAndTime(fullDate, isha)
    );
    const ishaInterval = getIntervalAttrs(
        combineDateAndTime(fullDate, isha),
        nextDayFajrDate
    );

    return `
    <div class="swiper-slide">
        <div class="day-card">
            ${ramadanBanner}
            <div class="date-heading">
                ${dayBadge}
                <h2 class="date">${capitalizedWeekday}, ${date} ${month} ${year}</h2>
            </div>
            <div class="prayer-list">
                <div class="prayer"${fajrInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.fajr)}Сабах${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(down, sunrise)}
                </div>
                <div class="prayer">
                    <span class="name">${getIconBadge(PRAYER_ICONS.sunrise)}Изгрев</span>
                    ${getTimeWithLabelHtml(sunrise, 'край на Сабах')}
                </div>
                <div class="prayer prayer--voluntary"${duhaInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.duha)}Духа${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(duha, dhuhr)}
                </div>
                <div class="prayer${isFriday ? ' prayer--jumah' : ''}"${dhuhrInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.sun)}${
        isFriday ? 'Джумая' : 'Пладнина'
    }${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(dhuhr, asr)}
                </div>
                <div class="prayer"${asrInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.sun)}Икинди${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(asr, maghrib)}
                </div>
                <div class="prayer"${maghribInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.sunset)}Акшам${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(maghrib, isha)}
                </div>
                <div class="prayer"${ishaInterval}>
                    <span class="name">${getIconBadge(PRAYER_ICONS.isha)}Еция / Витр${NOW_BADGE_HTML}</span>
                    ${getTimeRangeHtml(isha, nextDayFajr)}
                </div>
                <div class="prayer prayer--voluntary">
                    <span class="name">${getIconBadge(PRAYER_ICONS.tehajjud)}Техадж-джуд</span>
                    ${getTimeRangeHtml(tehajjud, nextDayFajr)}
                </div>
            </div>
        </div>
    </div>
    `;
}
