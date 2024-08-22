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
    }
    else if(player.blackjack && !dealer.blackjack){
        console.log("Player wins with 21: blackjack!");
        displayHandResults(player.hand[0].handValue, dealer.hand.handValue);
    }
    else if(dealer.blackjack && !player.blackjack){
        console.log("Dealer wins with 21: blackjack :(");
        displayHandResults(player.hand[0].handValue, dealer.hand.handValue);
    }

    //
    //
    // else if(dealer.hand.bust){
    //     console.log("Player wins, Dealer busted!");
    // }
    // else if(player.hand[0].bust){
    //     console.log("Player busted :(");
    // }
    // else if(player.hand[0].stand && dealer.hand.stand){
    //
    //     let playerMax = Math.max(...player.hand[0].handValue.filter(value => value <= 21));
    //     let dealerMax = Math.max(...dealer.hand.handValue.filter(value => value <= 21));
    //     if(playerMax > dealerMax){
    //         console.log(`Player wins with ${playerMax}, dealers has ${dealerMax}`);
    //     }
    //     else if(playerMax === dealerMax){
    //         console.log("Push!")
    //     }
    //     else{
    //         console.log(`Dealer wins with ${dealerMax}, player has ${playerMax}`);
    //     }
    // }
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
 * TODO: Add double downs, standing at appropriate times against dealer, splitting
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
            await playerPlaysNormally(player, playerFirstHand, dealer, deck_id);
            break;
        case PLAYER_DOUBLE_DOWNS:
            console.log("Player is doubling down, good luck");
            await playerTurn(player, playerFirstHand, dealer, deck_id);
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
    console.log();
    await dealerTurn(player, dealer, deck_id)
    displayResults(player, dealer);

    // while( !player.hand[0].bust && !player.blackjack && !player.hand[0].stand && !dealer.blackjack )
    // {
    //
    //     let newCard = await dealNumberOfCards(deck_id, 1);
    //     console.log(`Player received a ${newCard[0].value}`);
    //     player.hand[0].cards.push(newCard[0]);
    //     updatePlayer(player, dealer);
    // }
    //
    // while( !player.hand[0].bust && !player.blackjack && !dealer.blackjack && !dealer.hand.stand && !dealer.hand.bust){
    //      let newCard = await dealNumberOfCards(deck_id, 1);
    //      console.log(`Dealer received a ${newCard[0].value}`);
    //      dealer.hand.cards.push(newCard[0]);
    //      updateDealer(dealer)
    // }
    // displayResults(player, dealer);

}
function setupForFirstTurn(player, dealer){
    // Calculate starting hands and positions
    const FIRST_HAND_OR_CARD = 0;
    let playerStartingHand = player.hand[FIRST_HAND_OR_CARD];
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
    console.log(`Player starts with: ${player.hand[FIRST_HAND_OR_CARD].cards[FIRST_HAND_OR_CARD].value} and ${player.hand[FIRST_HAND_OR_CARD].cards[1].value}`);
    console.log(`Dealer starts with: ${dealer.hand.cards[0].value} and a hidden card\n`);
}

async function playerPlaysNormally(player, handNum, dealer, deck_id){
    while( !player.hand[handNum].bust && !player.blackjack && !player.hand[handNum].stand && !dealer.blackjack )
    {
        await playerTurn(player, handNum, dealer, deck_id);
    }
    console.log();
}
async function playerTurn(player, handNum, dealer, deck_id){
    let newCard = await dealNumberOfCards(deck_id, 1);
    console.log(`Player received a ${newCard[0].value}`);
    player.hand[0].cards.push(newCard[0]);
    updatePlayer(player, dealer);
}
async function playerSplitTurn(player, dealer, deck_id){
    let newHand = {
        stand: false,
        bust: false,
        cards: [],
        handValue:[]
    }
    newHand.cards.push(player.hand[0].cards.pop());
    player.hand.push(newHand);
    player.hand.forEach((hand, index) => {
        playerPlaysNormally(player, index, dealer, deck_id);
    });
}
async function dealerTurn(player, dealer, deck_id){
    while( !player.blackjack && !dealer.blackjack && !dealer.hand.stand && !dealer.hand.bust && !checkIfPlayerFullyBusted(player.hand)){
        let newCard = await dealNumberOfCards(deck_id, 1);
        console.log(`Dealer received a ${newCard[0].value}`);
        dealer.hand.cards.push(newCard[0]);
        updateDealer(dealer)
    }
    console.log();
}
function checkIfPlayerFullyBusted(playerHands){
    return playerHands.every(hand => hand.bust);
}

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

function hasPair(playerHand)
{
    return playerHand.cards[0].value === playerHand.cards[1].value;
}

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
function getTrueCardValue(cardValue){
    if(cardValue === 'KING' || cardValue === "QUEEN" || cardValue === 'JACK'){
        return 10;
    }
    else if(cardValue === 'ACE'){
        return 11;
    }
    else{
        return cardValue;
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
    player.hand[handNum].stand = shouldStand(dealer, player);
    player.hand[handNum].bust = player.hand[handNum].handValue.every(value => value > 21);
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