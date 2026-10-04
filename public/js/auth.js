//Шапка: вошёл пользователь или нет
const userMenu = document.querySelector('#user-menu');

async function renderUserMenu() {
    if (!userMenu) return;

    const user = await getCurrentUser();

    if (!user) {
        userMenu.innerHTML = '<a href="login.html">Войти</a>';
        return;
    }

    userMenu.innerHTML = `
        <span class="user-name"></span>
        <button class="logout-btn" type="button" id="logout-btn">Выйти</button>
    `;
    userMenu.querySelector('.user-name').textContent = user.name;

    document.querySelector('#logout-btn').addEventListener('click', async () => {
        await logout();
        window.location.href = '/';
    });
}

renderUserMenu();