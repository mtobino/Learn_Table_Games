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

export const RESET_GAME = 'RESET_GAME';
export const resetGame = () =>({
    type: RESET_GAME
});

export const PLAYER_SPLIT_CARDS = 'PLAYER__SPLIT_CARDS';
export const playerSplitCards = () => ({
    type: PLAYER_SPLIT_CARDS
});

export const PLAYER_DOUBLE_DOWNS = 'PLAYER_DOUBLE_DOWNS';
export const playerDoubleDowns = (card) =>({
    type: PLAYER_DOUBLE_DOWNS,
    payload: { card }
});
export const PLAYER_STANDS = 'PLAYER_STANDS';
export const playerStands = (handNum) => ({
    type: PLAYER_STANDS,
    payload: { handNum }
});
export const LOAD_CARD_IN_PROGRESS = 'LOAD_CARD_IN_PROGRESS';
export const loadCardInProgress = () =>({
    type: LOAD_CARD_IN_PROGRESS,
});

export const LOAD_CARD_SUCCESS = 'LOAD_CARD_SUCCESS';
export const loadCardSuccess = () =>({
    type: LOAD_CARD_SUCCESS,
});
export const LOAD_CARD_FAILURE = 'LOAD_CARD_FAILURE';
export const loadCardFailure = () =>({
    type: LOAD_CARD_FAILURE,
});
export const LOAD_PLAYER_SUGGESTED_ACTION_IN_PROGRESS = 'LOAD_PLAYER_SUGGESTED_ACTION_IN_PROGRESS';
export const loadPlayerSuggestedActionInProgress = () =>({
    type:LOAD_PLAYER_SUGGESTED_ACTION_IN_PROGRESS
});
export const LOAD_PLAYER_SUGGESTED_ACTION_SUCCESS = 'LOAD_PLAYER_SUGGESTED_ACTION_SUCCESS';
export const loadPlayerSuggestedActionSuccess = (handNum, suggestedAction) => ({
    type: LOAD_PLAYER_SUGGESTED_ACTION_SUCCESS,
    payload: { handNum, suggestedAction }
});
export const LOAD_PLAYER_SUGGESTED_ACTION_FAILED = 'LOAD_PLAYER_SUGGESTED_ACTION_FAILED';
export const loadPlayerSuggestedActionFailed = () => ({
    type: LOAD_PLAYER_SUGGESTED_ACTION_FAILED
});