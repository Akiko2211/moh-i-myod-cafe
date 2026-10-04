// === Шапка: тень при прокрутке и мобильное меню ===
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('#menu-toggle');
const siteNav = document.querySelector('#site-nav');

function setMenuOpen(isOpen) {
    siteHeader.classList.toggle('is-menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}

menuToggle.addEventListener('click', () => {
    setMenuOpen(!siteHeader.classList.contains('is-menu-open'));
});

// Клик по пункту меню — закрываем его
siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
        setMenuOpen(false);
    }
});

// Escape закрывает меню
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setMenuOpen(false);
    }
});

// Тень у шапки, когда страница прокручена
function updateHeaderShadow() {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true });
updateHeaderShadow();
