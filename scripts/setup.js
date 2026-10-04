// === Подготовка проекта перед запуском ===
// Запускается автоматически перед `npm start` и `npm run dev`:
// 1) проверяет версию Node.js,
// 2) устанавливает недостающие пакеты,
// 3) создаёт .env из примера, если его нет,
// 4) заполняет базу данных меню и столиками.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// --- 1. Версия Node.js: нужен встроенный модуль node:sqlite (22.5+) ---
const [major, minor] = process.versions.node.split('.').map(Number);

if (major < 22 || (major === 22 && minor < 5)) {
    console.error(`\n❌ Нужен Node.js 22.5 или новее, у вас ${process.versions.node}.`);
    console.error('   Скачайте актуальную версию: https://nodejs.org\n');
    process.exit(1);
}

// --- 2. Пакеты из package.json ---
const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const dependencies = Object.keys(packageJson.dependencies ?? {});
const missing = dependencies.filter(name => !existsSync(`node_modules/${name}/package.json`));

if (missing.length > 0) {
    console.log(`📦 Устанавливаю пакеты: ${missing.join(', ')}...`);
    execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });
}

// --- 3. Файл настроек .env ---
if (!existsSync('.env')) {
    // Логин и пароль почты оставляем пустыми: без них сайт работает,
    // просто письма не отправляются
    const example = readFileSync('.env.example', 'utf-8')
        .replace(/^MAIL_USER=.*$/m, 'MAIL_USER=')
        .replace(/^MAIL_PASS=.*$/m, 'MAIL_PASS=');

    writeFileSync('.env', example);
    console.log('📝 Создан файл .env (почта не настроена — письма отправляться не будут)');
}

// --- 4. База данных ---
// NODE_NO_WARNINGS прячет предупреждение «SQLite is an experimental feature»
execSync('node db/seed.js', {
    stdio: 'inherit',
    env: { ...process.env, NODE_NO_WARNINGS: '1' }
});
