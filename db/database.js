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

export default db;