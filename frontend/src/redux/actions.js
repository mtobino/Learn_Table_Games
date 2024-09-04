export const PLAYER_DRAW_CARD = 'PLAYER_DRAW_CARD';
export const playerDrawCard = (card, handNum) => ({
    type: PLAYER_DRAW_CARD,
    payload:  { card, handNum }
});
export const DEALER_DRAW_CARD = 'DEALER_DRAW_CARD';
export const dealerDrawCard = card => ({
   type: DEALER_DRAW_CARD,
   payload: { card }
});

export const REMOVE_ALL_CARDS = 'REMOVE_ALL_CARDS';
export const removeAllCards = () =>({
    type: REMOVE_ALL_CARDS
});

export const PLAYER_SPLIT_CARDS = 'PLAYER__SPLIT_CARDS';
export const playerSplitCards = () => ({
    type: PLAYER_SPLIT_CARDS
});

export const PLAYER_DOUBLE_DOWNS = 'PLAYER_DOUBLE_DOWNS';
export const playerDoubleDowns = () =>({
    type: PLAYER_DOUBLE_DOWNS
});
export const PLAYER_STANDS = 'PLAYER_STANDS';
export const playerStands = (handNum) => ({
    type: PLAYER_STANDS,
    payload: { handNum }
});
export const LOAD_DECK_IN_PROGRESS = 'LOAD_DECK_IN_PROGRESS';
export const loadDeckInProgress = () => ({
    type: LOAD_DECK_IN_PROGRESS
});
export const LOAD_DECK_SUCCESS = 'LOAD_DECK_SUCCESS';
export const loadDeckSuccess = deckId =>({
    type: LOAD_DECK_SUCCESS,
    payload: { deckId }
});
export const LOAD_DECK_FAILURE = 'LOAD_DECK_FAILURE';
export  const loadDeckFailure = () => ({
    type: LOAD_DECK_FAILURE
})
