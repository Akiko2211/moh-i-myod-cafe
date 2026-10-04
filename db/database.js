import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync('cafe.db');
db.exec (`
   CREATE TABLE IF NOT EXISTS products (
   id              INTEGER PRIMARY KEY AUTOINCREMENT,    
   name            TEXT     NOT NULL,
   description     TEXT     NOT NULL,
   price           INTEGER  NOT NULL,
   image           TEXT     NOT NULL
   ) 
   
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name  TEXT    NOT NULL,
        customer_phone TEXT    NOT NULL,
        customer_email TEXT,
        comment        TEXT,
        total          INTEGER NOT NULL,
        status         TEXT    NOT NULL DEFAULT 'new',
        created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id   INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        name       TEXT    NOT NULL,
        price      INTEGER NOT NULL,
        quantity   INTEGER NOT NULL
    )
`);

export default db;