import db from './database.js';
import { products } from '../data/products.js';

db.exec('DELETE FROM products');

const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, price, image)
    VALUES (?, ?, ?, ?, ?)
    `);

for (const product of products) {
    insertProduct.run(
        product.id,
        product.name,
        product.description,
        product.price,
        product.image
    );
}

console.log(`Добавлено товаров: ${products.length}`);
