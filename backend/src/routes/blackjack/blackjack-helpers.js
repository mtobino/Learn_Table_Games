/**
 * Getter and boolean functions for blackjack
 *
 * @author Matthew Tobino
 */
const {
    calculatePossibleValues,
    hasPair,
    getTrueCardValue,
    isSoft,
    inRange
} = require('./blackjack-utility')
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
function getSuggestedAction (playerCards, dealerFaceUpCard){
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


module.exports = { getSuggestedAction, getSuggestedActionMessage }