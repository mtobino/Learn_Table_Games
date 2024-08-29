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

app.get("/api/blackjack/query/", (req, res) => {
    // Request would look like "http:localhost:8000/api/blackjack/query?cards=1,2,ACE
    const { cards }  = req.query;
    console.log(cards);
    res.send(JSON.stringify(cards.split(',')));
});

app.get("/api/blackjack/params/:cards",(req, res) =>{
    // Request would look like "http:localhost:8000/api/blackjack/params/1,2,ACE
    const { cards }  = req.params;
    // To make it an array of values for future function, do cards.split(',') to make the above request be ["1", "2", "ACE"]
    console.log(cards);
    res.send(JSON.stringify(cards.split(',')));
});

app.get("/home", (req, res) => {
    res.send(JSON.stringify("Hello"));
} )
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Listening on port ' + PORT));