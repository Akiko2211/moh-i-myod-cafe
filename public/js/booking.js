// === Бронь столика ===
const OPEN_MINUTES = 8 * 60;
const LAST_START_MINUTES = 20 * 60;
const SLOT_STEP = 30;
const MAX_DAYS_AHEAD = 30;
const MAX_GUESTS = 6;

const bookingForm = document.querySelector('#booking-form');
const dateInput = document.querySelector('#booking-date');
const timeSelect = document.querySelector('#booking-time');
const guestsSelect = document.querySelector('#booking-guests');
const hallTables = document.querySelector('#hall-tables');
const selectedInfo = document.querySelector('#booking-selected');
const bookingButton = document.querySelector('#booking-btn');
const bookingMessage = document.querySelector('#booking-message');

let cafeTables = [];
let busyTableIds = [];
let selectedTableId = null;

// --- Вспомогательные функции для дат ---

// Дата в формате ГГГГ-ММ-ДД по местному времени
function toDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function minutesToTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
}

// Правильное окончание: 1 место, 2 места, 5 мест
function pluralize(count, [one, few, many]) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

const SEAT_WORDS = ['место', 'места', 'мест'];

function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
}

// Свободное время на выбранную дату (для сегодня — только будущее)
function getTimeSlots(dateValue) {
    const now = new Date();
    const isToday = dateValue === toDateValue(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slots = [];

    for (let minutes = OPEN_MINUTES; minutes <= LAST_START_MINUTES; minutes += SLOT_STEP) {
        if (isToday && minutes <= currentMinutes) continue;
        slots.push(minutesToTime(minutes));
    }

    return slots;
}

// --- Поля формы ---

function setupDateLimits() {
    const today = new Date();
    const lastDay = new Date();
    lastDay.setDate(today.getDate() + MAX_DAYS_AHEAD);

    dateInput.min = toDateValue(today);
    dateInput.max = toDateValue(lastDay);

    // Если сегодня свободного времени уже нет — предлагаем завтра
    if (getTimeSlots(toDateValue(today)).length > 0) {
        dateInput.value = toDateValue(today);
    } else {
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        dateInput.value = toDateValue(tomorrow);
    }
}

function fillTimeOptions() {
    const previousTime = timeSelect.value;
    const slots = getTimeSlots(dateInput.value);

    timeSelect.innerHTML = '';

    for (const slot of slots) {
        timeSelect.add(new Option(slot, slot));
    }

    if (slots.includes(previousTime)) {
        timeSelect.value = previousTime;
    }
}

function fillGuestOptions() {
    for (let count = 1; count <= MAX_GUESTS; count++) {
        guestsSelect.add(new Option(String(count), String(count)));
    }
    guestsSelect.value = '2';
}

// --- Схема зала ---

function getTableState(table) {
    if (busyTableIds.includes(table.id)) return 'busy';
    if (table.seats < Number(guestsSelect.value)) return 'small';
    return 'free';
}

const STATE_TEXT = {
    free: 'свободен',
    busy: 'занят',
    small: 'мало мест'
};

function renderHall() {
    // Если выбранный столик стал недоступен — снимаем выбор
    const selected = cafeTables.find(table => table.id === selectedTableId);
    if (selected && getTableState(selected) !== 'free') {
        selectedTableId = null;
    }

    hallTables.innerHTML = cafeTables.map(table => {
        const state = getTableState(table);
        const isSelected = table.id === selectedTableId;

        return `
            <button
                type="button"
                class="hall-table hall-table--${table.shape} hall-table--seats-${table.seats} is-${state} ${isSelected ? 'is-selected' : ''}"
                style="left: ${table.x}%; top: ${table.y}%;"
                data-id="${table.id}"
                aria-pressed="${isSelected}"
                aria-label="Столик ${table.label}, мест: ${table.seats}, ${STATE_TEXT[state]}"
                ${state !== 'free' ? 'disabled' : ''}
            >
                <span class="hall-table-label">${table.label}</span>
                <span class="hall-table-seats">${table.seats} ${pluralize(table.seats, SEAT_WORDS)}</span>
            </button>
        `;
    }).join('');

    updateSelectedInfo();
}

function updateSelectedInfo() {
    const table = cafeTables.find(item => item.id === selectedTableId);

    selectedInfo.textContent = table
        ? `Выбран столик №${table.label} на ${table.seats} ${pluralize(table.seats, SEAT_WORDS)}`
        : 'Выберите свободный столик на схеме';
}

async function updateAvailability() {
    if (!dateInput.value || !timeSelect.value) {
        busyTableIds = cafeTables.map(table => table.id);
        renderHall();
        return;
    }

    busyTableIds = await getBusyTables(dateInput.value, timeSelect.value);
    renderHall();
}

// --- События ---

dateInput.addEventListener('change', () => {
    fillTimeOptions();
    updateAvailability();
});

timeSelect.addEventListener('change', updateAvailability);
guestsSelect.addEventListener('change', renderHall);

hallTables.addEventListener('click', (event) => {
    const button = event.target.closest('.hall-table');
    if (!button || button.disabled) return;

    selectedTableId = Number(button.dataset.id);
    bookingMessage.textContent = '';
    renderHall();
});

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    bookingMessage.textContent = '';

    if (!selectedTableId) {
        bookingMessage.textContent = 'Выберите столик на схеме';
        return;
    }

    const formData = Object.fromEntries(new FormData(bookingForm));

    bookingButton.disabled = true;

    try {
        const booking = await createBooking({ ...formData, tableId: selectedTableId });

        const emailNote = booking.confirmationEmail
            ? ` Подтверждение отправили на ${booking.confirmationEmail}.`
            : '';

        bookingMessage.textContent =
            `Столик №${booking.tableLabel} забронирован на ${formatDate(booking.date)} в ${booking.time}. Ждём вас!${emailNote}`;

        selectedTableId = null;
        bookingForm.querySelectorAll('.booking-contacts input, .booking-contacts textarea')
            .forEach(field => { field.value = ''; });
    } catch (error) {
        bookingMessage.textContent = error.message;
    } finally {
        bookingButton.disabled = false;
        updateAvailability();
    }
});

// --- Запуск ---

async function initBooking() {
    setupDateLimits();
    fillTimeOptions();
    fillGuestOptions();

    try {
        cafeTables = await getTables();
        await updateAvailability();
    } catch (error) {
        hallTables.innerHTML = '<p class="hall-error">Не удалось загрузить схему зала. Попробуйте обновить страницу.</p>';
        console.error(error);
    }
}

initBooking();
