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
    CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        total      INTEGER NOT NULL,
        created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
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