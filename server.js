import express from 'express';
import { products } from './data/products.js';

const app = express();
const PORT = 3000;

// Отдаём файлы сайта из папки public
app.use(express.static('public'));

// API: список товаров
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Запуск сервера

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});