// Запросы на сервер
async function getProducts() {
    const response = await fetch('/api/products');

    if(!response.ok) {
        throw new Error('Не удалось загруить меню');
    }

    return response.json();
}