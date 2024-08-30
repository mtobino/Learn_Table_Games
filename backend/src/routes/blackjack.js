const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { suggestedAction, getSuggestedActionMessage } = require('./blackjack-helpers');

/**
 * Send the deck to the client
 */
router.get('/get-deck', async (req, res) => {
    try {
        const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
        res.send(response.data);
    } catch (e) {
        console.error(e);
    }
});

/**
 * Get the suggested move for the player and send it to the client
 */
router.get('/suggested-next-move', (req, res) =>{
    // Request looks like: http://localhost:8000/api/blackjack/suggested-next-move?playerCards=5,5&dealerFaceUpCard=4
    const { playerCards, dealerFaceUpCard } = req.query;
    const cardValues = playerCards.split(',');

    const playerRecommendedAction = suggestedAction(cardValues, dealerFaceUpCard);
    res.send(JSON.stringify({
        recommendedAction : playerRecommendedAction,
        recommendedActionMessage: getSuggestedActionMessage(playerRecommendedAction)
    }));

});

/**
 * Draw a variable amount of cards from the deck and sent it to the client
 */
router.get('/draw/:deckId', async (req, res) => {
    // Request looks like: http://localhost:8000/api/blackjack/draw/tcbe4t1kpk7u?count=4
    try{
        const { count } = req.query;
        const { deckId } = req.params;
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
        const { cards } = response.data;
        res.send({cards: cards});
    } catch (e){
        console.error(e);
        res.status(400).send(e);
    }
});

router.put('/shuffle/:deckId', async (req, res) => {
    // Request looks like: http://localhost:8000/api/blackjack/shuffle/tcbe4t1kpk7u
    try{
        const { deckId } = req.params;
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`)
        res.send(response.data);
    } catch (e) {
        console.error(e);
        res.status(400).send(e);
    }
});

module.exports = router;