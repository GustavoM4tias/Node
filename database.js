const path = require('path');
const Database = require('better-sqlite3');

// Conectar ao banco de dados SQLite
const db = new Database(path.join(__dirname, 'tarefas.db'));

module.exports = db;
