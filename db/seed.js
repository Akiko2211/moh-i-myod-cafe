import db from './database.js';
import { fillDatabase } from './fill.js';

const counts = fillDatabase(db);

console.log(`Товаров в базе обновлено: ${counts.products}`);
console.log(`Столиков в базе обновлено: ${counts.tables}`);
