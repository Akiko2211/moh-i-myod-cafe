// Данные
const products = [
    {
        id: 1,
        name: 'Медовый раф',
        description: 'Эспрессо, сливки и цветочный мёд',
        price: 290,
        image: 'images/menu/honey-raf.webp'
    },
    {
        id: 2,
        name: 'Капучино',
        description: 'Классика с бархатной молочной пенкой',
        price: 220,
        image: 'images/menu/cappuccino.webp'
    },
    {
        id: 3,
        name: 'Матча-латте',
        description: 'Японский зелёный чай на кокосовом молоке',
        price: 280,
        image: 'images/menu/matcha-latte.webp'
    }
];

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

// Корзина
const cart = [];
const cartCount = document.querySelector('#cart-count');

function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    updateCartCount();
    console.log('Корзина', cart);
}

function updateCartCount() {
    let total = 0;
    for (const item of cart) {
        total += item.quantity;
    }
    cartCount.textContent = total;
}

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