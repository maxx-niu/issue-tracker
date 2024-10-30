import Database from "better-sqlite3";

const db = new Database('database.db', {verbose: console.log});

db.exec(
    `CREATE TABLE IF NOT EXISTS issues(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT CHECK(status IN ('Open', 'In Progress', 'Resolved')) NOT NULL DEFAULT 'Open',
        priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
    )`
);

export default db;