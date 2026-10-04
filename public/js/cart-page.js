//Страница корзины
const cartItemContainer = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-btn');
const checkoutMessage = document.querySelector('#checkout-message');
let products = [];

function createCartItem(item) {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';

    const itemTotal = product.price * item.quantity;

    return `
     <article class="cart-item">
            <img src="${product.image}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${product.name}</h3>
                <p class="cart-item-price">${product.price}&nbsp;₽</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" type="button" data-id="${product.id}" data-action="decrease" aria-label="Уменьшить количество">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" type="button" data-id="${product.id}" data-action="increase" aria-label="Увеличить количество">+</button>
            </div>
            <p class="cart-item-total">${itemTotal}&nbsp;₽</p>
        </article>
    `;
}

function getCartTotal() {
    let total = 0;

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
}

function renderCart() {
    if (cart.length === 0) {
        cartItemContainer.innerHTML = `
        <p class="cart-empty">Корзина пуста. <a href="/#menu">Перейти в меню</a></p>
        `;
        cartTotal.innerHTML = '0&nbsp;₽';
        return;
    }

    cartItemContainer.innerHTML = cart.map(createCartItem).join('');
    cartTotal.innerHTML = `${getCartTotal()}&nbsp;₽`;
}

cartItemContainer.addEventListener('click', function (event) {
    const button = event.target.closest('.qty-btn');
    if (!button) return;

    const productId = Number(button.dataset.id);
    const delta = button.dataset.action === 'increase' ? 1 : -1;

    changeQuantity(productId, delta);
    renderCart();
});

checkoutButton.addEventListener('click', async () => {
    checkoutMessage.textContent = '';

    if (cart.length === 0) {
        checkoutMessage.textContent = 'Корзина пуста';
        return;
    }

    checkoutButton.disabled = true;

    try {
        const order = await createOrder(cart);
        clearCart();
        renderCart();
        checkoutMessage.textContent = `Заказ №${order.orderId} оформлен! Сумма: ${order.total} ₽`;
    } catch (error) {
        if (error.status === 401) {
            window.location.href = 'login.html?redirect=cart';
            return;
        }
        checkoutMessage.textContent = error.message;
    } finally {
        checkoutButton.disabled = false;
    }
});

async function initCartPage() {
    try {
        products = await getProducts();
        renderCart();
    } catch (error) {
        cartItemContainer.innerHTML = '<p>Не удалось загрузить корзину. Попробуйте обновить страницу.</p>';
        console.error(error);
    }
}
initCartPage();