import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import db from './db/database.js';


const app = express();
const PORT = 3000;

//Настройки
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(express.static('public'));

//Товары
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

// Регистрация
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Пароль должен быть не короче 8 символов' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db.prepare('SELECT id FROM users WHERE email =?').get(normalizedEmail);
    if (existingUser) {
        return res.status(409).json({error: 'Пользователь с такой почтой уже зарегистрирован'});
    }

    const passwordHach = await bcrypt.hash(password, 10);

    const result = db.prepare(
        'INSERT INTO users (name, email, pasword_hash) VALUES (?, ?, ?)'
    ).run(name.trim(), normalizedEmail, passwordHach);

    req.session.userID = Number(result.lastInsertRowid);

    res.status(201).json({
        id: req.session.userID,
        name: name.trim(),
        email: normalizedEmail
    });
});

// Вход
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({error: 'Введите почту и пароль'});
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    const isPasswordValid = user && await bcrypt.compare(password, user.password_hash);

    if(!isPasswordValid) {
        return res.status(401).json({ error: 'Неверная почта или пароль'});
    }

    req.session.userID = user.id;

    res.json({ id: user.id, name: user.name, email: user.email });
});

//Текущий пользователь
app.get('/api/me', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).json({ error: 'Не авторизирован' });
    }

    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.session.userID);

    if(!user) {
        return res.status(401).json({ error: 'Не авторизирован' });
    }

    res.json(user);
});

//Выход
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

// Запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});