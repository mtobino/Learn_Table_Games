/**
 * Baseline code to play a game of blackjack
 * @author Matthew Tobino
 */
const axios = require('axios');

const PLAYER_STANDS = 'PLAYER_STANDS';
const PLAYER_DOUBLE_DOWNS = 'PLAYER_DOUBLE_DOWN';
const PLAYER_SPLITS = 'PLAYER_SPLITS';
const PLAYER_HITS = 'PLAYER_HITS';
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
    if(player.blackjack && dealer.blackjack){
        console.log("Both hit blackjack: Push!");
    }
    else if(player.blackjack && !dealer.blackjack){
        console.log("Player wins with 21: blackjack!");
    }
    else if(dealer.blackjack && !player.blackjack){
        console.log("Dealer wins with 21: blackjack :(");
    }
    else if(dealer.hand.bust){
        console.log("Player wins, Dealer busted!");
    }
    else if(player.hand[0].bust){
        console.log("Player busted :(");
    }
    else if(player.hand[0].stand && dealer.hand.stand){

        let playerMax = Math.max(...player.hand[0].handValue.filter(value => value <= 21));
        let dealerMax = Math.max(...dealer.hand.handValue.filter(value => value <= 21));
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

    console.log(player.hand[0].handValue);
    console.log(dealer.hand.handValue);
}


/**
 * Rudimentary blackjack simulator, grabs a deck, distributes cards, and then runs a sim of what the player
 * would usually do
 *
 * TODO: Add double downs, standing at appropriate times against dealer, splitting
 *
 * @returns {Promise<void>} no returns
 */
const playRound = async () => {
    let { deck_id } = await getCardDeck();
    let dealer = {
        hand : {
            cards: [],
            handValue: [],
            stand: false,
            bust: false,
        },
        blackjack: false,
    };
    let player = {
        blackjack: false,
        hand:[
            {
                stand: false,
                bust: false,
                cards: [],
                handValue:[]
            }
        ]
    };
    let drawnCards = await dealNumberOfCards(deck_id, 4);
    let oscillator = true;
    drawnCards.forEach(card => {
        if(oscillator){
            player.hand[0].cards.push(card);
        }
        else{
            dealer.hand.cards.push(card);
        }
        oscillator = !oscillator;
    });
    firstTurn(player, dealer);

    while( !player.hand[0].bust && !player.blackjack && !player.hand[0].stand && !dealer.blackjack )
    {

        let newCard = await dealNumberOfCards(deck_id, 1);
        console.log(`Player received a ${newCard[0].value}`);
        player.hand[0].cards.push(newCard[0]);
        updatePlayer(player, dealer);
    }

    while( !player.hand[0].bust && !player.blackjack && !dealer.blackjack && !dealer.hand.stand && !dealer.hand.bust){
         let newCard = await dealNumberOfCards(deck_id, 1);
         console.log(`Dealer received a ${newCard[0].value}`);
         dealer.hand.cards.push(newCard[0]);
         updateDealer(dealer)
    }
    displayResults(player, dealer);

}
function firstTurn(player, dealer){
    // Calculate starting hands and positions
    let playerStartingHand = player.hand[0];
    let dealerStartingHand = dealer.hand;
    // give players their hand values
    playerStartingHand.handValue = calculatePossibleValues(playerStartingHand.cards);
    dealerStartingHand.handValue = calculatePossibleValues(dealerStartingHand.cards);
    // adjust player information depending on their hand values
    updatePlayer(player, dealer);
    updateDealer(dealer);
    // check for first turn blackjacks
    player.blackjack = playerStartingHand.handValue.includes(21);
    dealer.blackjack = dealerStartingHand.handValue.includes(21);
    // Display current status
    console.log(`Player starts with: ${player.hand[0].cards[0].value} and ${player.hand[0].cards[1].value}`);
    console.log(`Dealer starts with: ${dealer.hand.cards[0].value} and ${dealer.hand.cards[1].value}`);
}

function determineSecondTurnAction(player, dealer){
    
}

/**
 * Take any player and adjust their logic values based on the scores they have
 *
 * @param dealer            The dealer being fixed
 */
function updateDealer (dealer){
    let hand = dealer.hand;
    hand.handValue = calculatePossibleValues(dealer.hand.cards);
    hand.stand = dealer.hand.handValue.filter(value =>  value >= 17 && value <= 21).length > 0;
    hand.bust = dealer.hand.handValue.every(value => value > 21);
}

/**
 * Take any player and adjust their logic values based on the scores they have
 *
 * @param   player            The current player being fixed
 * @param   dealer
 */
function updatePlayer (player, dealer) {
    player.hand[0].handValue = calculatePossibleValues(player.hand[0].cards);
    player.hand[0].stand = shouldStand(dealer, player);
    player.hand[0].bust = player.hand[0].handValue.every(value => value > 21);
}
/**
 * If the player is within the range of 12-16 inclusive, AND the dealer's first card is in the range of 2-6, Stand
 * OR
 * If the player has a soft 17 or higher, Stand
 *
 * @param dealer            The dealer
 * @param player            The player
 * @returns {boolean}       True, iff the player should stand
 */
function shouldStand( dealer, player) {

    let handValues = player.hand[0].handValue;
    let dealerCardValue = dealer.hand.cards[0].value;

    if(isSoft(handValues)){
        let softMax = Math.max(...handValues);
        if(softMax < 18){
            return false;
        }
        else if(softMax === 18){
            return inRange(dealerCardValue, 9, 10) || dealerCardValue === "ACE";
        }
        else{
            return true;
        }
    }
    if(handValues.includes(12)) {
        return inRange(dealerCardValue, 4, 6);
    }

    let equalToOrOver17 = handValues.filter(value =>  inRange(value, 17, 21) ).length > 0;
    let dealerInRange = inRange(dealerCardValue, 2, 6);
    let playerInRange = handValues.filter(value => inRange(value, 12, 16)).length > 0
    return equalToOrOver17 || (dealerInRange && playerInRange);
}

/**
 * Returns whether a value is within a range inclusive on both sides
 *
 * @param value         The value being tested
 * @param min           The minimum range
 * @param max           The maximum range
 * @returns {boolean}   True iff the value is within the range inclusive
 */
function inRange(value, min, max){
    return value >= min && value <= max;
}

/**
 * Takes in the handValues array and determines if the value contains a soft hand (EX Below)
 * EX: [6, 16] contains a soft 16
 * EX: [14, 24] does not contain a soft hand
 *
 * @define soft hands are hands that have an ace and thus can use the ace as a 1 or 11 without going over 21
 * @param handValues    The hand values being tested
 * @returns {boolean}   True iff the values contain a soft hand
 */
function isSoft(handValues)
{
    return handValues.filter(value => value <= 21).length > 1;
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