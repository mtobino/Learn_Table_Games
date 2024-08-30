// Player suggested actions
const PLAYER_STANDS = 'PLAYER_STANDS';
const PLAYER_DOUBLE_DOWNS = 'PLAYER_DOUBLE_DOWN';
const PLAYER_SPLITS = 'PLAYER_SPLITS';
const PLAYER_HITS = 'PLAYER_HITS';

/**
 * Take in the players cards and the dealers face up card and spit out the action for the player to take
 *
 * @param playerCards           The player's cards
 * @param dealerFaceUpCard      The dealer's face up card
 * @returns {string}            The action the player should take
 */
function suggestedAction (playerCards, dealerFaceUpCard){
    let playerHandValue = calculatePossibleValues(playerCards);

    if(shouldStand(playerHandValue, dealerFaceUpCard))
    {
        return PLAYER_STANDS;
    }

    else if( shouldDoubleDown(playerHandValue[0], dealerFaceUpCard)){
        return PLAYER_DOUBLE_DOWNS;
    }
    else return HitSplitOrStand(playerCards, dealerFaceUpCard);

}

/**
 * Get the respective message to go along with the recommended action.
 *
 * @param suggestedAction   The player's suggested course of action
 * @returns {string}        The message to the player about why they should do it
 */
function getSuggestedActionMessage(suggestedAction){
    switch(suggestedAction){
        case PLAYER_STANDS:
            return "It is recommended you stand now. Hitting now could either cause you to bust and lose, or take away" +
                "the card that would have busted the dealer. Stand and trust the odds should be in your favor.";
        case PLAYER_HITS:
            return "It is recommended you draw another card. The dealer will most likely win if you just stand now." +
                "Draw a card now and hope that it is enough for you to win or at least not bust.";
        case PLAYER_DOUBLE_DOWNS:
            return "It is recommended you should double down here. The chances of you hitting a card that could " +
                "guarantee your victory are higher than normal. Take that chance and trust your luck.";
        case PLAYER_SPLITS:
            return "It is recommended you should split your cards here. This is a rare opportunity for you to strike " +
                "gold twice. Test your luck and hope for the best.";
        default:
            return "Error, you have hit an impossible action. Congrats :D";
    }
}

/**
 * Given a black jack hand, determine all the possible scores that can be reached with that hand
 *
 * @param cardValues    The given hand
 * @returns {any[]}     The value/s of said hand
 */
function calculatePossibleValues(cardValues) {
    let totalWithoutAces = 0;
    let aceCount = 0;
    let possibleValues = new Set();

    cardValues.forEach(value => {
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
        return parseInt(cardValue, 10);
    }
}
/**
 * Determines if the player's hand contains a pair
 *
 * @param playerHand    The player's hand
 * @returns {boolean}   true iff the players first care matches their second
 */
function hasPair(playerHand) {
    return playerHand[0] === playerHand[1];
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
 * Based on the players current hand, should they split, hit, or stand
 *
 * @param playerHand        The players current hand
 * @param dealerCardFaceUp       The dealer's hand
 * @returns {string|string} The player's next course of action
 */
function HitSplitOrStand(playerHand, dealerCardFaceUp){
    if(hasPair(playerHand))
    {
        let playerCardValue = getTrueCardValue(playerHand[0]);
        let dealerCardValue = getTrueCardValue(dealerCardFaceUp);
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
 * Whether the player should double down or not
 *
 * @param playerHandValue    The player's hand value
 * @param dealerCardValue    The dealer's front card's value
 * @returns {boolean}   True iff the player should double down
 */
function shouldDoubleDown(playerHandValue, dealerCardValue){
    let dealerFaceUpCardValue = getTrueCardValue(dealerCardValue);
    if(playerHandValue === 9 && inRange(dealerFaceUpCardValue, 3, 6)){
        return true;
    }
    else if(playerHandValue === 10 && inRange(dealerFaceUpCardValue, 2, 9))
    {
        return true;
    }
    else return playerHandValue === 11 && inRange(dealerFaceUpCardValue, 2, 10);
}


module.exports = { suggestedAction, getSuggestedActionMessage }