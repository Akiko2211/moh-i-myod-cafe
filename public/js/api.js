// Запросы на сервер
async function getProducts() {
    const response = await fetch('/api/products');

    if (!response.ok) {
        throw new Error('Не удалось загрузить меню');
    }

    return response.json();
}

async function getCurrentUser() {
    const response = await fetch('/api/me');
    
    if (!response.ok) {
        return null;
    }
    return response.json();
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
}