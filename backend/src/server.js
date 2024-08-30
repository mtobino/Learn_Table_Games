const express = require('express');
//const fs = require('fs');
//const admin = require('firebase-admin');
require('dotenv/config.js');
//const { db, connectToDatabase } = require('./db.js');
//const path = require('path');

const app = express();

// const { fileURLToPath } = require('url');
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename)

app.use(express.json());
//app.use(express.static(path.join(__dirname, '../build')));

// app.get(/^(?!\/api).+/, (req, res) => {
//     res.sendFile(path.join(__dirname, '../build/index.html'));
// })
app.use('/api', require('./routes/routes'));

app.get("/home", (req, res) => {
    res.send(JSON.stringify("Hello"));
} )
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Listening on port ' + PORT));