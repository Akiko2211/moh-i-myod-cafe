// Находим контейнер на странице
const menuGrid = document.querySelector('#menu-grid');

// Шаблон карточки
function createProductCard(product) {
    return `
<article class="product-card">
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class = "product-description">${product.description}</p>
        <div class="product-footer">
            <span class="product-price">${product.price}&nbsp;₽</span>
            <button class="add-to-cart" type="button" data-id="${product.id}" aria-label="Добавить в корзину: ${product.name}">+</button>
        </div>
    </div>
</article>
`;
}

// Отрисовка всего меню
function renderMenu() {
    const cardsHTML = products.map(createProductCard);
    menuGrid.innerHTML = cardsHTML.join('');
}

renderMenu();

// клик по +
menuGrid.addEventListener('click', function (event) {
    const button = event.target.closest('.add-to-cart');

    if (!button) return;

    const productId = Number(button.dataset.id);
    addToCart(productId);

    button.textContent = '✓';
    setTimeout(() => {
        button.textContent = '+';
    }, 1000);
});