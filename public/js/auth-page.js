//Формы входа и регистрации
const registerForm = document.querySelector('#register-form');
const loginForm = document.querySelector('#login-form');
const formError = document.querySelector('#form-error');
const params = new URLSearchParams(window.location.search);
const redirectTarget = params.get('redirect') === 'cart' ? '/cart.html' : '/';

async function handleAuthSubmit(event, url) {
    event.preventDefault();
    formError.textContent = '';

    const form = event.target;
    const data = Object.fromEntries(new FormData(form));
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            formError.textContent = result.error || 'Что-то пошло не так';
            return;
        }

        window.location.href = redirectTarget;
    } catch (error) {
        formError.textContent = 'Нет связи с сервером. Попробуйте позже.';
        console.error(error);
    } finally {
        submitButton.disabled = false;
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', event => handleAuthSubmit(event, '/api/register'));
}

if (loginForm) {
    loginForm.addEventListener('submit', event => handleAuthSubmit(event, '/api/login'));
}