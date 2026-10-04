import express from 'express';
import db from './db/database.js';
import {
    sendReceipt,
    sendBookingConfirmation,
    notifyAdminAboutOrder,
    notifyAdminAboutBooking
} from './mailer.js';
import { validateContact } from './validation.js';

const app = express();
const PORT = 3000;

// === Настройки ===
app.use(express.json());
app.use(express.static('public'));

// === Товары ===
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id').all();
    res.json(products);
});

// === Оформление заказа ===
app.post('/api/orders', (req, res) => {
    const { customer, items } = req.body;

    const { contact, error } = validateContact(customer);
    if (error) {
        return res.status(400).json({ error });
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
        `).run(contact.name, contact.phone, contact.email || null, contact.comment || null, total);

        const orderId = Number(orderResult.lastInsertRowid);

        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of orderItems) {
            insertItem.run(orderId, item.productId, item.name, item.price, item.quantity);
        }

        db.exec('COMMIT');

        res.status(201).json({ orderId, total, receiptEmail: contact.email || null });

        const { created_at: createdAt } = db.prepare('SELECT created_at FROM orders WHERE id = ?').get(orderId);

        const orderForMail = {
            id: orderId,
            customerName: contact.name,
            customerPhone: contact.phone,
            customerEmail: contact.email,
            comment: contact.comment,
            total,
            createdAt,
            items: orderItems
        };

        sendReceipt(orderForMail).catch(error => {
            console.error(`Не удалось отправить чек к заказу №${orderId}:`, error.message);
        });

        notifyAdminAboutOrder(orderForMail).catch(error => {
            console.error(`Не удалось уведомить кафе о заказе №${orderId}:`, error.message);
        });
    } catch (error) {
        db.exec('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Не удалось оформить заказ' });
    }
});

// === Бронь столиков: правила ===
const OPEN_MINUTES = 8 * 60;         // первая бронь в 08:00
const LAST_START_MINUTES = 20 * 60;  // последняя бронь в 20:00 (кафе до 22:00)
const SLOT_STEP = 30;                // шаг выбора времени — 30 минут
const BOOKING_DURATION = 120;        // бронь на 2 часа
const MAX_DAYS_AHEAD = 30;           // бронировать можно на 30 дней вперёд
const MAX_GUESTS = 6;

function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function minutesToTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
}

// Проверяет дату и время, возвращает { slot } или { error }
function parseSlot(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^\d{2}:\d{2}$/.test(String(time))) {
        return { error: 'Укажите дату и время' };
    }

    const day = new Date(`${date}T00:00`);
    if (Number.isNaN(day.getTime()) || toDateString(day) !== date) {
        return { error: 'Некорректная дата' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + MAX_DAYS_AHEAD);

    if (day < today || day > lastDay) {
        return { error: `Бронь доступна на ближайшие ${MAX_DAYS_AHEAD} дней` };
    }

    const [hours, mins] = time.split(':').map(Number);
    const startMinutes = hours * 60 + mins;

    if (startMinutes < OPEN_MINUTES || startMinutes > LAST_START_MINUTES || startMinutes % SLOT_STEP !== 0) {
        return { error: 'Выберите время с 08:00 до 20:00' };
    }

    if (date === toDateString(now) && startMinutes <= now.getHours() * 60 + now.getMinutes()) {
        return { error: 'Это время уже прошло' };
    }

    return {
        slot: {
            date,
            time,
            startsAt: `${date} ${time}`,
            endsAt: `${date} ${minutesToTime(startMinutes + BOOKING_DURATION)}`
        }
    };
}

// Пересечение броней: чужая бронь начинается раньше, чем кончается наша,
// и кончается позже, чем начинается наша
const BUSY_TABLES_SQL = `
    SELECT DISTINCT table_id FROM bookings
    WHERE status != 'cancelled' AND starts_at < ? AND ends_at > ?
`;

// === Столики ===
app.get('/api/tables', (req, res) => {
    const tables = db.prepare('SELECT id, label, seats, shape, x, y FROM cafe_tables ORDER BY id').all();
    res.json(tables);
});

// === Занятые столики на дату и время ===
app.get('/api/tables/busy', (req, res) => {
    const { slot, error } = parseSlot(req.query.date, req.query.time);
    if (error) {
        return res.status(400).json({ error });
    }

    const rows = db.prepare(BUSY_TABLES_SQL).all(slot.endsAt, slot.startsAt);
    res.json(rows.map(row => row.table_id));
});

// === Создание брони ===
app.post('/api/bookings', (req, res) => {
    const { tableId, date, time, guests } = req.body;

    const { slot, error: slotError } = parseSlot(date, time);
    if (slotError) {
        return res.status(400).json({ error: slotError });
    }

    const guestsCount = Number(guests);
    if (!Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > MAX_GUESTS) {
        return res.status(400).json({ error: `Количество гостей — от 1 до ${MAX_GUESTS}` });
    }

    const table = db.prepare('SELECT id, label, seats FROM cafe_tables WHERE id = ?').get(Number(tableId));
    if (!table) {
        return res.status(400).json({ error: 'Выберите столик на схеме' });
    }

    if (guestsCount > table.seats) {
        return res.status(400).json({ error: `Столик №${table.label} вмещает до ${table.seats} человек` });
    }

    const { contact, error: contactError } = validateContact(req.body);
    if (contactError) {
        return res.status(400).json({ error: contactError });
    }

    // IMMEDIATE сразу блокирует запись: два человека не займут один столик одновременно
    db.exec('BEGIN IMMEDIATE');

    try {
        const conflict = db.prepare(`
            SELECT id FROM bookings
            WHERE table_id = ? AND status != 'cancelled' AND starts_at < ? AND ends_at > ?
        `).get(table.id, slot.endsAt, slot.startsAt);

        if (conflict) {
            db.exec('ROLLBACK');
            return res.status(409).json({ error: 'Этот столик уже заняли на выбранное время. Выберите другой.' });
        }

        const result = db.prepare(`
            INSERT INTO bookings (table_id, guest_name, guest_phone, guest_email, comment, guests, starts_at, ends_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            table.id, contact.name, contact.phone, contact.email || null,
            contact.comment || null, guestsCount, slot.startsAt, slot.endsAt
        );

        db.exec('COMMIT');

        const bookingId = Number(result.lastInsertRowid);

        res.status(201).json({
            bookingId,
            tableLabel: table.label,
            date: slot.date,
            time: slot.time,
            confirmationEmail: contact.email || null
        });

        const bookingForMail = {
            id: bookingId,
            tableLabel: table.label,
            guests: guestsCount,
            date: slot.date,
            time: slot.time,
            durationHours: BOOKING_DURATION / 60,
            guestName: contact.name,
            guestPhone: contact.phone,
            guestEmail: contact.email,
            comment: contact.comment
        };

        sendBookingConfirmation(bookingForMail).catch(error => {
            console.error(`Не удалось отправить подтверждение брони №${bookingId}:`, error.message);
        });

        notifyAdminAboutBooking(bookingForMail).catch(error => {
            console.error(`Не удалось уведомить кафе о брони №${bookingId}:`, error.message);
        });
    } catch (error) {
        db.exec('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Не удалось создать бронь' });
    }
});

// === Запуск ===
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
