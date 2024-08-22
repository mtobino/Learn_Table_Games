/**
 * Baseline code to play a game of blackjack
 * @author Matthew Tobino
 */
const axios = require('axios');

/**?
 * Player First Turn possible Actions
 * @type {string}
 */
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
        console.log("New card deck gotten\n");
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
        displayHandResults(player.hand[0].handValue, dealer.hand.handValue);
        return;
    }
    else if(player.blackjack && !dealer.blackjack){
        console.log("Player wins with 21: blackjack!");
        displayHandResults(player.hand[0].handValue, dealer.hand.handValue);
        return;
    }
    else if(dealer.blackjack && !player.blackjack){
        console.log("Dealer wins with 21: blackjack :(");
        displayHandResults(player.hand[0].handValue, dealer.hand.handValue);
        return;
    }

    player.hand.forEach((hand, index) =>{
        console.log(`Now checking player hand number ${index + 1}`);
        if(dealer.hand.bust){
            console.log("Player wins, Dealer busted");
        }
        else if (hand.bust){
            console.log("Player busted :(");
        }
        else if (hand.stand && dealer.hand.stand){
            let playerMax = Math.max(...hand.handValue.filter(value => value <= 21));
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
        displayHandResults(hand.handValue, dealer.hand.handValue);
        console.log();
    });
}

function displayHandResults(playerHandValue, dealerHandValue){
    console.log(`Player hand value ${playerHandValue.toString()}`);
    console.log(`Dealer hand value ${dealerHandValue.toString()}`);
}

/**
 * Rudimentary blackjack simulator, grabs a deck, distributes cards, and then runs a sim of what the player
 * would usually do
 *
 * @returns {Promise<void>} no returns
 */
const playRound = async () => {
    let { deck_id } = await getCardDeck();
    const playerFirstHand = 0;
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
            player.hand[playerFirstHand].cards.push(card);
        }
        else{
            dealer.hand.cards.push(card);
        }
        oscillator = !oscillator;
    });
    setupForFirstTurn(player, dealer);
    let playerRecommendedAction = determineFirstTurnAction(player, dealer);

    switch(playerRecommendedAction){
        case PLAYER_HITS:
            console.log("Player hits normally and will not take any extra actions");
            await playerHitsUntilTheyCannot(player, playerFirstHand, dealer, deck_id);
            break;
        case PLAYER_DOUBLE_DOWNS:
            console.log("Player is doubling down, good luck");
            await playerHits(player, playerFirstHand, dealer, deck_id);
            break;
        case PLAYER_SPLITS:
            console.log('Player splitting their cards')
            await playerSplitTurn(player, dealer, deck_id);
            break;
        case PLAYER_STANDS:
            console.log("Player stands their cards");
            break;
        default:
            console.log("Error: Should not be reaching the default");
            break;
    }
    console.log(`\nDealer turns their card to reveal a ${dealer.hand.cards[1].value}`)
    await dealerTurn(player, dealer, deck_id)
    displayResults(player, dealer);
}

/**
 * Take the player and dealer, update their starting information and display their information
 * 
 * @param player    The player
 * @param dealer    The dealer the player is up against
 */
function setupForFirstTurn(player, dealer){
    // Calculate starting hands and positions
    const FIRST_HAND_OR_CARD = 0;
    let playerStartingHand = player.hand[FIRST_HAND_OR_CARD];
    let dealerStartingHand = dealer.hand;
    // adjust player information depending on their hand values
    updatePlayer(player, dealer);
    updateDealer(dealer);
    // check for first turn blackjacks
    player.blackjack = playerStartingHand.handValue.includes(21);
    dealer.blackjack = dealerStartingHand.handValue.includes(21);
    // Display current status
    console.log(`Player starts with: ${player.hand[FIRST_HAND_OR_CARD].cards[FIRST_HAND_OR_CARD].value} and ${player.hand[FIRST_HAND_OR_CARD].cards[1].value}`);
    console.log(`Dealer starts with: ${dealer.hand.cards[0].value} and a hidden card\n`);
}

/**
 * Play a round normally, hitting until the player busts, stands, had black jack or the dealer had blackjack
 * 
 * @param player                The player
 * @param handNum               The current hand that is being worked on
 * @param dealer                The dealer the player is facing
 * @param deck_id               The deck_id that is needed to call the deck API
 * @returns {Promise<void>}     No returns
 */
async function playerHitsUntilTheyCannot(player, handNum, dealer, deck_id){
    while( !player.hand[handNum].bust && !player.blackjack && !player.hand[handNum].stand && !dealer.blackjack )
    {
        await playerHits(player, handNum, dealer, deck_id);
    }
}

/**
 * Player hits, they get dealt a card and adjust their information based on the new card
 *
 * @param player                The player
 * @param handNum               The current hand of the player
 * @param dealer                The dealer the player is up against
 * @param deck_id               The deck_id that is needed to call the deck API
 * @returns {Promise<void>}     No returns
 */
async function playerHits(player, handNum, dealer, deck_id){
    let newCard = await dealNumberOfCards(deck_id, 1);
    console.log(`Player received a ${newCard[0].value} for hand ${handNum + 1}`);
    player.hand[handNum].cards.push(newCard[0]);
    updatePlayer(player, dealer, handNum);
}

/**
 * Player split their starting cards, and now will play two hands
 *
 * @param player                The player
 * @param dealer                The dealer the player is up against
 * @param deck_id               The deck_id needed to call the deck API
 * @returns {Promise<void>}     No returns
 */
async function playerSplitTurn(player, dealer, deck_id){
    let newHand = {
        stand: false,
        bust: false,
        cards: [],
        handValue:[]
    }
    let removedCard = player.hand[0].cards.pop()
    newHand.cards.push(removedCard);
    player.hand.push(newHand);
    let newCards = await dealNumberOfCards(deck_id, 2);
    player.hand[0].cards.push(newCards[0]);
    console.log(`Player Received a ${newCards[0].value} for hand 1 to start their new hand`)
    player.hand[1].cards.push(newCards[1]);
    console.log(`Player Received a ${newCards[1].value} for hand 2 to start their new hand`)
    updatePlayer(player, dealer, 0);
    updatePlayer(player, dealer, 1);
    for(let handNum = 0; handNum < player.hand.length; handNum++){
        await playerHitsUntilTheyCannot(player, handNum, dealer, deck_id);
    }
}

/**
 * The dealers turn, they go until they bust, stand, had blackjack at the start, or if the player is fully busted
 *
 * @param player            The player
 * @param dealer            The dealer the player is up against
 * @param deck_id           The deck_id needed to call the deck API
 * @returns {Promise<void>} No Returns
 */
async function dealerTurn(player, dealer, deck_id){
    while( !player.blackjack && !dealer.blackjack && !dealer.hand.stand && !dealer.hand.bust && !checkIfPlayerFullyBusted(player.hand)){
        let newCard = await dealNumberOfCards(deck_id, 1);
        console.log(`Dealer received a ${newCard[0].value}`);
        dealer.hand.cards.push(newCard[0]);
        updateDealer(dealer)
    }
    console.log();
}

/**
 * If the player is busted or not
 * @param {any[]} playerHands   The hands array of the player
 * @returns {boolean}           true iff the player has busted on every hand
 */
function checkIfPlayerFullyBusted(playerHands){
    return playerHands.every(hand => hand.bust);
}

/**
 * Determine the first action the player should take after receiving their cards
 *
 * @param player                The player
 * @param dealer                The dealer the player is up against
 * @returns {string|string}     The next course of action the player will take
 */
function determineFirstTurnAction(player, dealer){
    if(player.blackjack || dealer.blackjack)
    {
        return PLAYER_STANDS;
    }

    let playerHand = player.hand[0];
    if(playerHand.stand)
    {
        return PLAYER_STANDS;
    }

    let doubleDown = shouldDoubleDown(playerHand, dealer.hand);
    if(doubleDown){
        return PLAYER_DOUBLE_DOWNS;
    }
    return HitSplitOrStand(playerHand, dealer.hand);
}

/**
 * Whether the player should double down or not
 *
 * @param playerHand    The player's hand
 * @param dealerHand    The dealer's hand
 * @returns {boolean}   True iff the player should double down
 */
function shouldDoubleDown(playerHand, dealerHand){
    let dealerFaceUpCardValue = getTrueCardValue(dealerHand.cards[0].value);
    let playerHandValue = playerHand.handValue[0];
    if(playerHandValue === 9 && inRange(dealerFaceUpCardValue, 3, 6)){
        return true;
    }
    else if(playerHandValue === 10 && inRange(dealerFaceUpCardValue, 2, 9))
    {
        return true;
    }
    else return playerHandValue === 11 && inRange(dealerFaceUpCardValue, 2, 10);
}

/**
 * Determines if the player's hand contains a pair
 *
 * @param playerHand    The player's hand
 * @returns {boolean}   true iff the players first care matches their second
 */
function hasPair(playerHand) {
    return playerHand.cards[0].value === playerHand.cards[1].value;
}

/**
 * Based on the players current hand, should they split, hit, or stand
 *
 * @param playerHand        The players current hand
 * @param dealerHand        The dealer's hand
 * @returns {string|string} The player's next course of action
 */
function HitSplitOrStand(playerHand, dealerHand){
    if(hasPair(playerHand))
    {
        let playerCardValue = getTrueCardValue(playerHand.cards[0].value);
        let dealerCardValue = getTrueCardValue(dealerHand.cards[0].value);
        switch(playerCardValue){
            case 2:
            case 3:
                return inRange(dealerCardValue, 4, 7) ? PLAYER_SPLITS : PLAYER_HITS;
            case 4:
                return PLAYER_HITS;
            case 6:
                return inRange(dealerCardValue, 3, 6) ? PLAYER_SPLITS : PLAYER_HITS;
            case 7:
                return inRange(dealerCardValue, 2, 7) ? PLAYER_SPLITS : PLAYER_HITS;
            case 8:
                return PLAYER_SPLITS;
            case 9:
                return inRange(dealerCardValue, 2,6) || inRange(dealerCardValue, 8, 9) ? PLAYER_SPLITS : PLAYER_STANDS;
            case 10:
                return PLAYER_STANDS;
            case 11:
                return PLAYER_SPLITS;
            default:
                return PLAYER_HITS;
        }
    }
    else return PLAYER_HITS;
}

/**
 * Get the true value of the cards
 *
 * @param cardValue     The inputted card value
 * @returns {number}    The card's actual value
 */
function getTrueCardValue(cardValue){
    if(cardValue === 'KING' || cardValue === "QUEEN" || cardValue === 'JACK'){
        return 10;
    }
    else if(cardValue === 'ACE'){
        return 11;
    }
    else{
        return Number(cardValue);
    }
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
 * @param   player      The current player being fixed
 * @param   dealer      The dealer the player is against
 * @param   handNum     The hand the player is looking at, default value is zero meaning the player only has one hand
 */
function updatePlayer (player, dealer, handNum = 0) {
    player.hand[handNum].handValue = calculatePossibleValues(player.hand[handNum].cards);
    player.hand[handNum].stand = shouldStand(player.hand[handNum].handValue, dealer.hand.cards[0].value);
    player.hand[handNum].bust = player.hand[handNum].handValue.every(value => value > 21);
}
/**
 * If the player is within the range of 12-16 inclusive, AND the dealer's first card is in the range of 2-6, Stand
 * OR
 * If the player has a soft 17 or higher, Stand
 *
 * @param playerHandValues
 * @param dealerCardValue
 * @returns {boolean}       True, iff the player should stand
 */
function shouldStand(playerHandValues, dealerCardValue) {
    if(isSoft(playerHandValues)){
        let softMax = Math.max(...playerHandValues.filter(value => value <= 21));
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
    if(playerHandValues.includes(12)) {
        return inRange(dealerCardValue, 4, 6);
    }

    let equalToOrOver17 = playerHandValues.filter(value =>  inRange(value, 17, 21) ).length > 0;
    let dealerInRange = inRange(dealerCardValue, 2, 6);
    let playerInRange = playerHandValues.filter(value => inRange(value, 12, 16)).length > 0
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