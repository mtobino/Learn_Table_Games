/**
 * Utility functions for blackjack calculations
 *
 * @author Matthew Tobino
 */

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

module.exports = {calculatePossibleValues, inRange, isSoft, getTrueCardValue, hasPair};