import { createSelector } from '@reduxjs/toolkit';
import {getTrueCardValue} from "../ultility/blackjack-utility";
export const isLoading = state => state.blackjack.isLoading;
export const getPlayerData = state => state.blackjack.blackjackData.playerData;
export const getPlayerHand = createSelector(
    [getPlayerData],
    (data) => data.hand
);
export const hasPlayerSplit = createSelector(
    [getPlayerData],
    (data) => data.hasSplit
);
export const hasPlayerHitBlackjack = createSelector(
    [getPlayerData],
    (data) => data.blackjack
);



export const canSplitHand = createSelector(
    [
        hasPlayerSplit,
        getPlayerHand,
        (_, index) => index
    ],
    (hasSplit, hand, index) => {
        const [firstCard, secondCard] = hand[index].cards
        if(typeof firstCard === 'undefined' ) return false;
        return !hasSplit && getTrueCardValue(firstCard.value) === getTrueCardValue(secondCard.value);
    }
);
export const getPlayerCardValuesAsString = createSelector(
    [getPlayerHand, (_, index) => index],
    (hand, index) => {
        const cards = hand[index].cards;
        return cards.map(card => card.value).join(',');
    }
);


export const getPlayerRecommendedActionMessage = createSelector(
    [
        getPlayerHand,
        (_, handNum) => handNum
    ],
    (hand, handNum) => hand[handNum]?.hint?.recommendedActionMessage || 'Game Over, No hint to be found :P'
);

export const getDealerData = state => state.blackjack.blackjackData.dealerData;
export const getDealerHand = createSelector(
    [getDealerData],
    (data) => data.hand
)
export const getDealerFaceUpCard = createSelector(
    [getDealerHand],
    hand => hand?.cards[0] || {value: 0}
);
export const hasDealerHitBlackjack = createSelector(
    [getDealerData],
    (data) => data.blackjack
);

export const hasDealerStood = createSelector(
    [getDealerHand],
    (hand) => hand.stand
);
export const hasDealerBusted = createSelector(
    [getDealerHand],
    (hand) => hand.bust || false
);
export const hasPlayerTurnEnded = createSelector(
    [getPlayerHand, hasPlayerSplit, hasPlayerHitBlackjack, hasDealerHitBlackjack],
    (hand, hasSplit, playerBlackjack, dealerBlackjack) => {
        if(playerBlackjack || dealerBlackjack){
            return true;
        }
        else if(!hasSplit){
            return hand[0].stand || hand[0].bust
        }
        else{
            let playerTurnEnded = true;
            hand.forEach(hand => {
                playerTurnEnded = playerTurnEnded && (hand.stand || hand.bust);
            });
            return playerTurnEnded;
        }
    }
);
export const hasPlayerSpecificHandTurnEnded = createSelector(
    [
        getPlayerHand,
        (_, index) => index,
        hasPlayerHitBlackjack,
        hasDealerHitBlackjack
    ],
    (hand, index, playerBlackjack, dealerBlackjack) =>
        hand[index].bust || hand[index].stand || playerBlackjack || dealerBlackjack
);

export const getPlayerHandValue = createSelector(
    [getPlayerHand, (_, index) => index],
    (hand, index) => {
        if (hand[index].handValue.filter(value => value <= 21).length > 1) {
            return hand[index].handValue[0] + "/" + hand[index].handValue[1];
        } else return hand[index].handValue[0] + "";
    }
);

export const getDealerHandValue = createSelector(
    [getDealerHand],
    (hand) => {
        if(hand.handValue.filter(value => value <= 21).length > 1){
            return hand.handValue[0] + "/" + hand.handValue[1];
        }
        else return hand.handValue[0] + "";
    }
);

export const hasDealerTurnEnded = createSelector(
    [
        hasDealerHitBlackjack,
        hasDealerBusted,
        hasDealerStood,
        hasPlayerHitBlackjack,
        hasPlayerSplit,
        getPlayerHand
    ],
    (dealerBlackjack, bust, stand, playerBlackjack, hasSplit, playerHand) => {
        if(dealerBlackjack || playerBlackjack){
            return true
        }
        else if(!hasSplit){
            const playerBusted = playerHand.some(hand => hand.bust);
            if(playerBusted){
                return true;
            }
            else return stand || bust;
        }
        else{
            const playerFullBust = playerHand.every(hand => hand.bust);
            if(playerFullBust){
                return true
            }
            else return stand || bust;
        }
    }

);