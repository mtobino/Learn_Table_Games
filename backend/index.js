/**
 * Baseline code to play a game of Blackjack
 * @author Matthew Tobino
 */
const axios = require('axios');

/**
 * Given a black jack hand, determine all the possible scores that can be reached with that hand
 *
 * @param hand      The given hand
 * @returns {any[]} The value/s of said hand
 */
function calculatePossibleValues(hand) {
    let totalWithoutAces = 0;
    let aceCount = 0;
    let possibleValues = new Set();

    hand.forEach(card => {
        const value = card.value;
        if (value === "KING" || value === "QUEEN" || value === "JACK") {
            totalWithoutAces += 10;
        } else if (value === "ACE") {
            aceCount++;
        } else {
            totalWithoutAces += parseInt(value, 10); // For number cards
        }
    });

    // Generate all possible values considering Ace(s)
    for (let i = 0; i <= aceCount; i++) {
        let total = totalWithoutAces + (aceCount - i) * 11 + i;
        possibleValues.add(total);
    }

    return Array.from(possibleValues);
}

/**
 * Start off the program by retrieving a fresh deck of cards from the API
 *
 * @returns {Promise<any>} The data containing the deck of cards ID
 */
const getCardDeck= async () => {
    try{
        const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
        console.log("New card deck gotten");
        return response.data;
    }catch(e){
        console.error(e);
    }
}

/**
 * Given a player and a dealer, determine who wins based on their conditions
 *
 * @param player    The player (you)
 * @param dealer    The dealer, a CPU
 */
function displayResults(player, dealer){
    if(player.Hit21 && dealer.Hit21){
        console.log("Both hit 21: Push!");
    }
    else if(player.Hit21 && !dealer.Hit21){
        console.log("Player wins with 21!");
    }
    else if(dealer.Hit21 && !player.Hit21){
        console.log("Dealer wins with 21!");
    }
    else if(dealer.Bust){
        console.log("Player wins, Dealer busted!");
    }
    else if(player.Bust){
        console.log("Player busted :(");
    }
    else if(player.EqualToOrOver17 && dealer.EqualToOrOver17){
        let playerMax = player.handValue.filter(value => value < 21).sort((a, b) => b - a)[0];
        let dealerMax = dealer.handValue.filter(value => value < 21).sort((a, b) => b - a)[0];
        if(playerMax > dealerMax){
            console.log(`Player wins with ${playerMax}, dealers has ${dealerMax}`);
        }
        else if(playerMax === dealerMax){
            console.log("Push!")
        }
        else{
            console.log(`Dealer wins with ${dealerMax}, player has ${playerMax}`);
        }
    }

    console.log(player.handValue);
    console.log(dealer.handValue);
}


/**
 * Rudimentary Blackjack simulator, grabs a deck, distributes cards, and then runs a sim of what the player
 * would usually do
 *
 * TODO: Add double downs, standing, splitting
 *
 * @returns {Promise<void>} no returns
 */
const playRound = async () => {
    let { deck_id } = await getCardDeck();
    let dealer = {
        cards : [],
        Hit21: false,
        EqualToOrOver17: false,
        Bust: false,
        handValue: []
    };
    let player = {
        cards : [],
        Hit21: false,
        EqualToOrOver17: false,
        Bust: false,
        handValue: []
    };
    let drawnCards = await dealNumberOfCards(deck_id, 4);
    let oscillator = true;
    drawnCards.forEach(card => {
        if(oscillator){
            player.cards.push(card);
        }
        else{
            dealer.cards.push(card);
        }
        oscillator = !oscillator;
    });
    let playerValueCalc = calculatePossibleValues(player.cards);
    let dealerValueCalc = calculatePossibleValues(dealer.cards);
    fixPlayer(player, playerValueCalc);
    fixPlayer(dealer, dealerValueCalc);
    console.log(`Player starts with: ${player.cards[0].value} and ${player.cards[1].value}`);
    console.log(`Dealer starts with: ${dealer.cards[0].value} and ${dealer.cards[1].value}`);

    while( !player.Bust && !player.Hit21 && !player.EqualToOrOver17 && !dealer.Hit21 )
    {
        let newCard = await dealNumberOfCards(deck_id, 1);
        console.log(`Player received a ${newCard[0].value}`);
        player.cards.push(newCard[0]);
        playerValueCalc = calculatePossibleValues(player.cards);
        fixPlayer(player, playerValueCalc);
    }

    while( !player.Bust && !dealer.Hit21 && !dealer.EqualToOrOver17 && !dealer.Bust){
         let newCard = await dealNumberOfCards(deck_id, 1);
         console.log(`Dealer received a ${newCard[0].value}`);
         dealer.cards.push(newCard[0]);
         dealerValueCalc = calculatePossibleValues(dealer.cards);
         fixPlayer(dealer, dealerValueCalc)
    }
    displayResults(player, dealer);

}

/**
 * Take any player and adjust their logic values based on the scores they have
 *
 * @param player            The current player being fixed, can either be you or the dealer
 * @param playerValueCalc   The calculated score
 */
function fixPlayer (player, playerValueCalc){
    player.EqualToOrOver17 = playerValueCalc.filter(value =>  value >= 17 && value < 21).length > 0;
    player.Hit21 = playerValueCalc.includes(21);
    player.Bust = playerValueCalc.every(value => value > 21);
    player.handValue = playerValueCalc;
}


/**
 * Deal a variable number of cards depending on how many are needed
 *
 * @param deck_id           The deck ID needed to call the API
 * @param numberOfCards     The number of cards needed to be dealt
 * @returns {Promise<*>}    The card data from the API
 */
const dealNumberOfCards = async(deck_id, numberOfCards = 1) =>{
    try{
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${numberOfCards}`);
        const { cards } = response.data;
        return cards;
    } catch (e) {
        console.error(e);
    }
}

playRound();