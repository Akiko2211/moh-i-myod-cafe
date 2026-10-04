import express from 'express';
import db from './db/database.js';
import { sendReceipt } from './mailer.js';

const app = express();
const PORT = 3000;

// === Настройки ===
app.use(express.json());
app.use(express.static('public'));

// === Товары ===
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

// === Проверка данных клиента ===
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone) {
    const digits = String(phone).replace(/\D/g, '');

    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        return '+7' + digits.slice(1);
    }

    if (digits.length === 10) {
        return '+7' + digits;
    }

    return null;
}

// === Оформление заказа ===
app.post('/api/orders', (req, res) => {
    const { customer, items } = req.body;

    if (!customer || typeof customer !== 'object') {
        return res.status(400).json({ error: 'Укажите контактные данные' });
    }

    const name = String(customer.name ?? '').trim();
    const phone = normalizePhone(customer.phone ?? '');
    const email = String(customer.email ?? '').trim().toLowerCase();
    const comment = String(customer.comment ?? '').trim();

    if (name.length < 2 || name.length > 50) {
        return res.status(400).json({ error: 'Укажите имя' });
    }

    if (!phone) {
        return res.status(400).json({ error: 'Укажите корректный номер телефона' });
    }

    if (email && !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: 'Проверьте адрес почты' });
    }

    if (comment.length > 300) {
        return res.status(400).json({ error: 'Комментарий слишком длинный' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Корзина пуста' });
    }

    const getProduct = db.prepare('SELECT id, name, price FROM products WHERE id = ?');
    const orderItems = [];

    for (const item of items) {
        const product = getProduct.get(item.id);
        const quantity = Number(item.quantity);

        if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
            return res.status(400).json({ error: 'Некорректный состав заказа' });
        }

        orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity
        });
    }

    let total = 0;
    for (const item of orderItems) {
        total += item.price * item.quantity;
    }

    db.exec('BEGIN');

    try {
        const orderResult = db.prepare(`
            INSERT INTO orders (customer_name, customer_phone, customer_email, comment, total)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, phone, email || null, comment || null, total);

        const orderId = Number(orderResult.lastInsertRowid);

        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of orderItems) {
            insertItem.run(orderId, item.productId, item.name, item.price, item.quantity);
        }

        db.exec('COMMIT');

        res.status(201).json({ orderId, total, receiptEmail: email || null });

        const { created_at: createdAt } = db.prepare('SELECT created_at FROM orders WHERE id = ?').get(orderId);

        sendReceipt({
            id: orderId,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            comment,
            total,
            createdAt,
            items: orderItems
        }).catch(error => {
            console.error(`Не удалось отправить чек к заказу №${orderId}:`, error.message);
        });
    } catch (error) {
        db.exec('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Не удалось оформить заказ' });
    }
});

// === Запуск ===
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
