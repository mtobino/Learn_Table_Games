import { createSelector } from '@reduxjs/toolkit';
export const isLoading = state => state.blackjack.isLoading;
export const getPlayerData = state => state.blackjack.blackjackData.playerData;
export const getDealerData = state => state.blackjack.dealerData;
export const playerStood = createSelector(
    [getPlayerData],
    data => data.hand.every(hand => hand.stand)
);
export const getPlayerHand = createSelector(
    [getPlayerData],
    (data) => data.hand
);

export const playerBlackjack = createSelector(
    [getPlayerData],
    (data) => data.blackjack
);
export const playerBusted = createSelector(
    [getPlayerData],
    (data) => data.hand.every(hand => hand.bust)
)
export const playerTurnEnd = createSelector(
    [playerBlackjack, playerBusted, playerStood],
    (blackjack, bust, stand) => blackjack || bust || stand
);