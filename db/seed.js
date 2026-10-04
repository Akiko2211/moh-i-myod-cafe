import db from './database.js';
import { products } from '../data/products.js';
import { cafeTables } from '../data/tables.js';

// UPSERT: если записи с таким id нет — добавить, если есть — обновить.
// Удалять нельзя: на товары и столики ссылаются заказы и брони.
const upsertProduct = db.prepare(`
    INSERT INTO products (id, name, description, price, image)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        price = excluded.price,
        image = excluded.image
`);

for (const product of products) {
    upsertProduct.run(product.id, product.name, product.description, product.price, product.image);
}

console.log(`Товаров в базе обновлено: ${products.length}`);

const upsertTable = db.prepare(`
    INSERT INTO cafe_tables (id, label, seats, shape, x, y)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        label = excluded.label,
        seats = excluded.seats,
        shape = excluded.shape,
        x = excluded.x,
        y = excluded.y
`);

for (const table of cafeTables) {
    upsertTable.run(table.id, table.label, table.seats, table.shape, table.x, table.y);
}

console.log(`Столиков в базе обновлено: ${cafeTables.length}`);
