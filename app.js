const PRAYER_ICONS = {
    fajr: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 14.6A7 7 0 1 1 9 6a5.7 5.7 0 0 0 8.5 8.6Z"/><path d="M19 3v2.4M17.8 4.2h2.4"/></svg>',
    sunrise: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h18M8 17a4 4 0 0 1 8 0"/><path d="M12 3v3.4"/><path d="M9.5 8.4 12 6l2.5 2.4" stroke-width="1.5"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.2M12 19v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.8 12h2.2M19 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    sunset: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h18M8 17a4 4 0 0 1 8 0"/><path d="M12 3v3.4"/><path d="M9.5 5 12 7.4 14.5 5" stroke-width="1.5"/></svg>',
    isha: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
    tehajjud: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 14.3A6.6 6.6 0 1 1 9 4.3a5.4 5.4 0 0 0 7.5 10Z"/><path d="M19 3v2.2M17.9 4.1h2.2M6 15.5v1.8M5.1 16.4h1.8"/></svg>'
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.error('service worker not registered', err));
}

document.addEventListener('DOMContentLoaded', async () => {
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

    selectedCityElement.addEventListener('change', (event) =>
        changeTimeToSelectedCity(event, swiperInstance)
    );
    renderPrayerSlides(prayerTimeTable, swiperInstance);
});

async function changeTimeToSelectedCity(event, swiperInstance) {
    const element = event.target;
    const selectedCity = element.options[element.selectedIndex].value;
    localStorage.setItem('selectedCity', selectedCity);

    const prayerTimeTable = await getTimeForSelectedCity(selectedCity);

    swiperInstance.removeAllSlides();
    renderPrayerSlides(prayerTimeTable, swiperInstance);
}

function renderPrayerSlides(allNamazForThisYear, swiperInstance) {
    let currentFullDate = new Date();
    currentFullDate.setHours(0, 0, 0, 0);

    const previousYear = currentFullDate.getFullYear() - 1;
    const nextYear = currentFullDate.getFullYear() + 1;

    currentFullDate.setDate(currentFullDate.getDate() - 1);

    if (currentFullDate.getFullYear() === previousYear) {
        currentFullDate.setDate(currentFullDate.getDate() + 1);
    }

    while (currentFullDate.getFullYear() !== nextYear) {
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
            currentFullDate
        );
        swiperInstance.appendSlide(slideTemplate);

        currentFullDate = getNextDate(currentFullDate, 1);
    }

    swiperInstance.slideTo(1);
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

function isToday(dateToBeCompared) {
    const currentDate = new Date();
    const currentDateAsString = `${currentDate.getDate()}/${currentDate.getMonth()}/${currentDate.getFullYear()}`;
    const dateToBeComparedAsString = `${dateToBeCompared.getDate()}/${dateToBeCompared.getMonth()}/${dateToBeCompared.getFullYear()}`;

    if (currentDateAsString === dateToBeComparedAsString) {
        return true;
    }

    return false;
}

function isYesterday(dateToBeCompared) {
    const currentDate = new Date();
    const yesterdayDateAsString = `${
        currentDate.getDate() - 1
    }/${currentDate.getMonth()}/${currentDate.getFullYear()}`;
    const dateToBeComparedAsString = `${dateToBeCompared.getDate()}/${dateToBeCompared.getMonth()}/${dateToBeCompared.getFullYear()}`;

    if (yesterdayDateAsString === dateToBeComparedAsString) {
        return true;
    }

    return false;
}

function calculateRamadanDayNumber(ramadanStartDate, currentlyDisplayingDate) {
    const ramadanStartDateAsDate = new Date(ramadanStartDate);
    const ramadanEndDateAsDate = new Date(ramadanStartDateAsDate);
    ramadanEndDateAsDate.setDate(ramadanStartDateAsDate.getDate() + 31);

    const differenceInMilliseconds = currentlyDisplayingDate.getTime() - ramadanStartDateAsDate.getTime();
    const oneDay = 1000 * 60 * 60 *24;
    const daysSinceStartOfRamadan = Math.floor(differenceInMilliseconds / oneDay);

    return daysSinceStartOfRamadan;
}

function isRamadan(ramadanStartDate, currentlyDisplayingDate) {
    const ramadanStartDateAsDate = new Date(ramadanStartDate);
    const ramadanEndDateAsDate = new Date(ramadanStartDateAsDate);
    ramadanEndDateAsDate.setDate(ramadanStartDateAsDate.getDate() + 30);

    if(ramadanEndDateAsDate.getTime() >= currentlyDisplayingDate.getTime() && ramadanStartDateAsDate.getTime() <= currentlyDisplayingDate.getTime()) {
        return true;
    }

    return false;
}

function getPrayerTemplate(prayerTimes, fullDate) {
    const { down, sunrise, dhuhr, asr, maghrib, isha, tehajjud } = prayerTimes;

    const date = fullDate.getDate();
    const month = fullDate.toLocaleString('bg', { month: 'long' });
    const year = fullDate.getFullYear();

    let dayBadge = '';
    if (isToday(fullDate)) {
        dayBadge = '<span class="day-badge day-badge--today">Днес</span>';
    } else if (isYesterday(fullDate)) {
        dayBadge = '<span class="day-badge">Вчера</span>';
    }

    const ramadanStartDate = '28/02/2025';
    const isRamadanMonthNow = isRamadan(ramadanStartDate, fullDate);
    const ramadanBanner = isRamadanMonthNow
        ? `<div class="ramadan-banner">${calculateRamadanDayNumber(
              ramadanStartDate,
              fullDate
          )}-и ден от Рамадан</div>`
        : '';

    const isFriday = fullDate.getDay() === 5;

    return `
    <div class="swiper-slide">
        <div class="day-card">
            ${ramadanBanner}
            <div class="date-heading">
                ${dayBadge}
                <h2 class="date">${date} ${month} ${year}</h2>
            </div>
            <div class="prayer-list">
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.fajr}Сабах</span>
                    <span class="time">${down}</span>
                </div>
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.sunrise}Изгрев</span>
                    <span class="time">${sunrise}</span>
                </div>
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.sun}${
        isFriday ? 'Джумая' : 'Пладнина'
    }</span>
                    <span class="time">${dhuhr}</span>
                </div>
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.sun}Икинди</span>
                    <span class="time">${asr}</span>
                </div>
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.sunset}Акшам</span>
                    <span class="time">${maghrib}</span>
                </div>
                <div class="prayer">
                    <span class="name">${PRAYER_ICONS.isha}Еция</span>
                    <span class="time">${isha}</span>
                </div>
                <div class="prayer prayer--tehajjud">
                    <span class="name">${PRAYER_ICONS.tehajjud}Техадж-джуд</span>
                    <span class="time">${tehajjud}</span>
                </div>
            </div>
        </div>
    </div>
    `;
}
