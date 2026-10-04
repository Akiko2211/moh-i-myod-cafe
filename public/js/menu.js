// === Меню с разделами ===
const CATEGORIES = [
    { id: 'coffee', name: 'Кофе' },
    { id: 'signature', name: 'Авторские напитки' },
    { id: 'tea', name: 'Чай и какао' },
    { id: 'breakfast', name: 'Завтраки' },
    { id: 'bakery', name: 'Выпечка' },
    { id: 'desserts', name: 'Десерты' }
];

const menuFilters = document.querySelector('#menu-filters');
const menuList = document.querySelector('#menu-list');

let products = [];
let activeCategory = 'all';

// Шаблон карточки
function createProductCard(product) {
    const portion = product.portion
        ? `<span class="product-portion">${product.portion}</span>`
        : '';

    return `
        <article class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-meta">
                        <span class="product-price">${product.price}&nbsp;₽</span>
                        ${portion}
                    </div>
                    <button class="add-to-cart" type="button" data-id="${product.id}" aria-label="Добавить в корзину: ${product.name}">+</button>
                </div>
            </div>
        </article>
    `;
}

// Кнопки-фильтры над меню
function renderFilters() {
    const buttons = [{ id: 'all', name: 'Всё меню' }, ...CATEGORIES];

    menuFilters.innerHTML = buttons.map(category => `
        <button
            class="menu-filter ${category.id === activeCategory ? 'is-active' : ''}"
            type="button"
            data-category="${category.id}"
            aria-pressed="${category.id === activeCategory}"
        >${category.name}</button>
    `).join('');
}

// Меню, разбитое на разделы
function renderMenu() {
    const visibleCategories = activeCategory === 'all'
        ? CATEGORIES
        : CATEGORIES.filter(category => category.id === activeCategory);

    menuList.innerHTML = visibleCategories.map(category => {
        const items = products.filter(product => product.category === category.id);
        if (items.length === 0) return '';

        return `
            <section class="menu-group" aria-labelledby="menu-group-${category.id}">
                <h3 class="menu-group-title" id="menu-group-${category.id}">${category.name}</h3>
                <div class="menu-grid">
                    ${items.map(createProductCard).join('')}
                </div>
            </section>
        `;
    }).join('');
}

menuFilters.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-filter');
    if (!button) return;

    activeCategory = button.dataset.category;
    renderFilters();
    renderMenu();
});

// Клик по «+»
menuList.addEventListener('click', (event) => {
    const button = event.target.closest('.add-to-cart');
    if (!button) return;

    addToCart(Number(button.dataset.id));

    button.textContent = '✓';
    setTimeout(() => {
        button.textContent = '+';
    }, 1000);
});

async function initMenu() {
    try {
        products = await getProducts();
        renderFilters();
        renderMenu();
    } catch (error) {
        menuList.innerHTML = '<p>Не удалось загрузить меню. Попробуйте обновить страницу.</p>';
        console.error(error);
    }
}

initMenu();
