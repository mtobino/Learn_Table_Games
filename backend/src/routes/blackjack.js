const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Send the deck to the client
 */
router.get('/get-deck', async (req, res) => {
    try {
        const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
        console.log("New card deck gotten\n");
        res.send(response.data);
    } catch (e) {
        console.error(e);
    }
});

router.get("/query", (req, res) => {
    // Request would look like "http:localhost:8000/api/blackjack/query?cards=1,2,ACE
    const { cards }  = req.query;
    console.log(cards);
    res.send(JSON.stringify(cards.split(',')));
});

router.get("/:cards",(req, res) =>{
    // Request would look like "http:localhost:8000/api/blackjack/params/1,2,ACE
    const { cards }  = req.params;
    // To make it an array of values for future function, do cards.split(',') to make the above request be ["1", "2", "ACE"]
    console.log(cards);
    res.send(JSON.stringify(cards.split(',')));
});

module.exports = router;