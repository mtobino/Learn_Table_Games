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
export const hasPlayerTurnEnded = createSelector(
    [getPlayerHand, hasPlayerSplit, hasPlayerHitBlackjack],
    (hand, hasSplit, blackjack) => {
        if(blackjack){
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
        (_, index) => index
    ],
    (hand, index) => hand[index].bust || hand[index].stand
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
    (hand, handNum) => hand[handNum].hint.recommendedActionMessage
);

export const getDealerData = state => state.blackjack.blackjackData.dealerData;
export const getDealerFaceUpCard = createSelector(
    [getDealerData],
    data => data.hand.cards[0]
);