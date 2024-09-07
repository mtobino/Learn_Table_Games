const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { getSuggestedAction, getSuggestedActionMessage } = require('./blackjack-helpers');


let deck_id = null;
const initializeDeck = async () => {
    const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
    deck_id = response.data.deck_id;
}
initializeDeck();
/**
 * Send the deck to the client
 */
router.get('/get-deck', async (req, res) => {
    try {
        //const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
        res.send({deck_id:deck_id});
    } catch (e) {
        console.error(e);
    }
});

/**
 * Get the suggested move for the player and send it to the client
 */
router.get('/suggested-next-move', (req, res) =>{
    // Request looks like: http://localhost:8000/api/blackjack/suggested-next-move?playerCards=5,5&dealerFaceUpCard=4
    const { playerCards, dealerFaceUpCard, hasSplit } = req.query;
    const cardValues = playerCards.split(',');
    const split = hasSplit === 'true';
    const playerRecommendedAction = getSuggestedAction(cardValues, dealerFaceUpCard, split);
    res.send({
        recommendedAction : playerRecommendedAction,
        recommendedActionMessage: getSuggestedActionMessage(playerRecommendedAction)
    });

});

/**
 * Draw a variable amount of cards from the deck and sent it to the client
 */
router.get('/draw', async (req, res) => {
    // Request looks like: http://localhost:8000/api/blackjack/draw/tcbe4t1kpk7u?count=4
    try{
        const { count } = req.query;
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`);
        const { cards } = response.data;
        res.send({cards: cards});
    } catch (e){
        console.error(e);
        res.status(400).send(e);
    }
});

router.put('/shuffle', async (req, res) => {
    // Request looks like: http://localhost:8000/api/blackjack/shuffle/tcbe4t1kpk7u
    try{
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/shuffle/`)
        res.send(response.data);
    } catch (e) {
        console.error(e);
        res.status(400).send(e);
    }
});

module.exports = router;