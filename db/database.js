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

db.exec(`
    CREATE TABLE IF NOT EXISTS cafe_tables (
        id    INTEGER PRIMARY KEY,
        label TEXT    NOT NULL,
        seats INTEGER NOT NULL,
        shape TEXT    NOT NULL,
        x     REAL    NOT NULL,
        y     REAL    NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id    INTEGER NOT NULL REFERENCES cafe_tables(id),
        guest_name  TEXT    NOT NULL,
        guest_phone TEXT    NOT NULL,
        guest_email TEXT,
        comment     TEXT,
        guests      INTEGER NOT NULL,
        starts_at   TEXT    NOT NULL,
        ends_at     TEXT    NOT NULL,
        status      TEXT    NOT NULL DEFAULT 'new',
        created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_table_time
    ON bookings (table_id, starts_at)
`);

export default db;