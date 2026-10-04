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