import { createSelector } from 'reselect';
export const getDeckId = state => state.blackjack.deckId;
export const isLoading = state => state.blackjack.isLoading;
