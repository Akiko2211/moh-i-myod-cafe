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

export default db;