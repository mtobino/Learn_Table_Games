// TODO: once three card poker CPU is done, turn it query data from server

const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Send the deck to the client
 */
router.get('/get-deck', async (req, res) => {
    try {
        const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        console.log("New card deck gotten\n");
        res.send(response.data);
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;