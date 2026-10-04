// === Запросы к серверу ===

// Список товаров
async function getProducts() {
    const response = await fetch('/api/products');

    if (!response.ok) {
        throw new Error('Не удалось загрузить меню');
    }

    return response.json();
}

// Оформление заказа
async function createOrder(order) {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.error || 'Не удалось оформить заказ');
        error.status = response.status;
        throw error;
    }

    return result;
}

// Столики для схемы зала
async function getTables() {
    const response = await fetch('/api/tables');

    if (!response.ok) {
        throw new Error('Не удалось загрузить схему зала');
    }

    return response.json();
}

// Занятые столики на дату и время
async function getBusyTables(date, time) {
    const params = new URLSearchParams({ date, time });
    const response = await fetch(`/api/tables/busy?${params}`);

    if (!response.ok) {
        return [];
    }

    return response.json();
}

// Создание брони
async function createBooking(booking) {
    const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.error || 'Не удалось создать бронь');
        error.status = response.status;
        throw error;
    }

    return result;
}
