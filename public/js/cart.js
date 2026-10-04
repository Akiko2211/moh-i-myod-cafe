const CART_KEY = 'moh-i-myod-cart';

function loadCart() {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

let cart = loadCart();

function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    updateCartCount();
}

function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    updateCartCount();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.querySelector('#cart-count');
    if (!cartCount) return;

    let total = 0;
    for (const item of cart) {
        total += item.quantity;
    }

    cartCount.textContent = total;
}

updateCartCount();