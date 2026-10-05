import { products } from '../data/products.js';
import { cafeTables } from '../data/tables.js';

// Заполняет базу товарами и столиками.
// UPSERT: если записи с таким id нет — добавить, если есть — обновить.
// Удалять нельзя: на товары и столики ссылаются заказы и брони.
export function fillDatabase(db) {
    const upsertProduct = db.prepare(`
        INSERT INTO products (id, category, name, description, price, portion, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            category = excluded.category,
            name = excluded.name,
            description = excluded.description,
            price = excluded.price,
            portion = excluded.portion,
            image = excluded.image
    `);

    for (const product of products) {
        upsertProduct.run(
            product.id, product.category, product.name, product.description,
            product.price, product.portion, product.image
        );
    }

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

    return { products: products.length, tables: cafeTables.length };
}
