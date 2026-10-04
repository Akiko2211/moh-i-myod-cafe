// === Запросы к серверу ===

// Список товаров
async function getProducts() {
    const response = await fetch('/api/products');

    if (!response.ok) {
        throw new Error('Не удалось загрузить меню');
    }

    return response.json();
}

// Кто сейчас вошёл
async function getCurrentUser() {
    const response = await fetch('/api/me');

    if (!response.ok) {
        return null;
    }

    return response.json();
}

// Выход из аккаунта
async function logout() {
    await fetch('/api/logout', { method: 'POST' });
}

// Оформление заказа
async function createOrder(items) {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.error || 'Не удалось оформить заказ');
        error.status = response.status;
        throw error;
    }

    return result;
}