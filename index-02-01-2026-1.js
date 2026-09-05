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
        if (currentDate == 30) {

        }
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

function calculateTehajjudPrayer(maghribPrayerTime, nextDayFajrPrayerTime) {
    if (!maghribPrayerTime || !nextDayFajrPrayerTime) {
        return 'липсва';
    }

    const [maghribHours, maghribMinutes] = maghribPrayerTime.split(':');

    const maghribTimeAsDate = new Date();
    maghribTimeAsDate.setHours(maghribHours);
    maghribTimeAsDate.setMinutes(maghribMinutes);

    const [nextDayFajrHours, nextDayFajrMinutes] =
        nextDayFajrPrayerTime.split(':');
    const fajrTimeAsDate = new Date();
    fajrTimeAsDate.setDate(fajrTimeAsDate.getDate() + 1);
    fajrTimeAsDate.setHours(nextDayFajrHours);
    fajrTimeAsDate.setMinutes(nextDayFajrMinutes);

    const nightDurationAsTimeStamp = fajrTimeAsDate - maghribTimeAsDate;
    const oneThirdOfTheNightAsTimeStamp = nightDurationAsTimeStamp / 3;

    const lastThirdOfTheNightStartsAtAsTimeStamp =
        fajrTimeAsDate - oneThirdOfTheNightAsTimeStamp;
    const lastThirdOfTheNightAsDate = new Date(
        lastThirdOfTheNightStartsAtAsTimeStamp
    );

    const lastThirdOfTheNightAsString = `${lastThirdOfTheNightAsDate.getHours()}:${lastThirdOfTheNightAsDate.getMinutes()}`;

    return lastThirdOfTheNightAsString;
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

function getPrayerTemplate(prayerTimes, fullDate, today) {
    ({ down, sunrise, dhuhr, asr, maghrib, isha, tehajjud } = prayerTimes);

    const date = fullDate.getDate();
    const month = fullDate.toLocaleString('bg', { month: 'long' });
    const year = fullDate.getFullYear();

    const todayClass = isToday(fullDate) ? 'today' : 'hidden';
    const yesterdayClass = isYesterday(fullDate) ? 'yesterday' : 'hidden';
    
    const ramadanStartDate = "28/02/2025";
    const isRamadanMonthNow = isRamadan(ramadanStartDate, fullDate);
    const ramadanClass = isRamadanMonthNow ? 'ramadan' : 'hidden';

    let ramadanDay = "";
    if(isRamadanMonthNow) {
        ramadanDay = calculateRamadanDayNumber(ramadanStartDate, fullDate);
    }

    const isFriday = fullDate.getDay() === 5;

    return `
    <div class="swiper-slide">
        <h3 class="ramadan-text ${ramadanClass}">${ramadanDay} Ден от Месец Рамадан</h3>
        <h2 class="date">
            <span class="${todayClass}">Днес: </span>
            <span class="${yesterdayClass}">Вчера: </span>
            ${date} ${month} ${year}</h2>
        <p class="prayer">
            <span class="name">Сабах:</span>
            <span data-down id="down" class="time">${down}</span>
        </p>
        <p class="prayer">
            <span class="name">Изгрев:</span>
            <span id="sunrise" class="time">${sunrise}</span>
        </p>
        <p class="prayer">
            <span class="name">${isFriday ? 'Джумая' : 'Пладнина'}:</span>
            <span id="dhuhr" class="time">${dhuhr}</span>
        </p>
        <p class="prayer">
            <span class="name">Икинди:</span>
            <span class="time">${asr}</span>
        </p>
        <p class="prayer">
            <span class="name">Акшам:</span>
            <span class="time">${maghrib}</span>
        </p>
        <p class="prayer">
            <span class="name">Еция:</span>
            <span class="time">${isha}</span>
        </p>
        <p class="prayer">
            <span class="name">Техадж-джуд:</span>
            <span class="time">${tehajjud}</span>
        </p>
    </div>
    `;
}
