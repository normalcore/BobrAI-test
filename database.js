const sqlite3 = require('sqlite3').verbose();

// Create database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        user_request TEXT,
        bot_response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});


module.exports = db