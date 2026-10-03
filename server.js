import express from 'express';
import db from './db/database.js';

const app = express();
const PORT = 3000;

// Отдаём файлы сайта из папки public
app.use(express.static('public'));

// API: список товаров
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

// Запуск сервера

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});