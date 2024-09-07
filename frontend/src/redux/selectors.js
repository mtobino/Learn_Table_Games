import { createSelector } from '@reduxjs/toolkit';
export const isLoading = state => state.blackjack.isLoading;
export const getPlayerData = state => state.blackjack.blackjackData.playerData;
export const getPlayerHand = createSelector(
    [getPlayerData],
    (data) => data.hand
);

export const playerBlackjack = createSelector(
    [getPlayerData],
    (data) => data.blackjack
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