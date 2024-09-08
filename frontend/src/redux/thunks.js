import {
    playerDrawCard,
    playerStands,
    playerSplitCards,
    playerDoubleDowns,
    dealerDrawCard,
    loadCardSuccess,
    loadCardInProgress,
    loadCardFailure,
    resetGame,
    loadPlayerSuggestedActionInProgress,
    loadPlayerSuggestedActionSuccess,
    loadPlayerSuggestedActionFailed,
    checkForBlackjacks
} from './actions';
import axios from "axios";


export const startTheGame = () => async (dispatch, getState) =>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw?count=4`);
        dispatch(loadCardSuccess());
        const { cards } = response.data;
        let oscillator = true;
        for(const card of cards){
            if(oscillator){
                dispatch(playerDrawCard(card, 0));
            }
            else dispatch(dealerDrawCard(card));
            oscillator = !oscillator;
        }
        dispatch(checkForBlackjacks())
    } catch (e) {
        dispatch(loadCardFailure());
        console.error(e);
    }
}

export const resetTheGame = () => async (dispatch, getState)=>{
    try{
        await axios.put(`api/blackjack/shuffle`);
        dispatch(resetGame());
    } catch (e) {
        console.error(e);
    }
}

export const getPlayerSuggestedAction = (handNum, playerCardsString, dealerFaceUpCard, hasSplit) => async (dispatch, getState) =>{
    try{
        dispatch(loadPlayerSuggestedActionInProgress());
        const response = await axios.get(`api/blackjack/suggested-next-move?playerCards=${playerCardsString}&dealerFaceUpCard=${dealerFaceUpCard.value}&hasSplit=${hasSplit}`);
        const suggestedAction = response.data
        dispatch(loadPlayerSuggestedActionSuccess(handNum, suggestedAction));
    } catch (e){
        dispatch(loadPlayerSuggestedActionFailed());
        console.error(e);
    }
}

export const playerDrawsACard = (handNum) => async (dispatch, getState)=>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw?count=1`);
        const { cards } = response.data;
        const [ card ] = cards;
        dispatch(playerDrawCard(card, handNum));
        dispatch(loadCardSuccess());
    } catch (e) {
        dispatch(loadCardFailure());
        console.error(e);
    }
};
export const playerStand = (handNum) => (dispatch, getState)=>{
    dispatch(playerStands(handNum));
}

export const dealerDrawsACard = () => async (dispatch, getState)=>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw?count=1`);
        const { cards } = response.data;
        const [ card ] = cards;
        dispatch(dealerDrawCard(card));
        dispatch(loadCardSuccess());
    } catch (e) {
        dispatch(loadCardFailure());
        console.error(e);
    }
};

export const doublesDown = () => async(dispatch, getState) =>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw?count=1`);
        const { cards } = response.data;
        const [ card ] = cards;
        dispatch(playerDoubleDowns(card));
        dispatch(loadCardSuccess());
    } catch (e) {
        dispatch(loadCardFailure());
        console.error(e);
    }
}
export const split = () => async(dispatch, getState) =>{
    try{
        dispatch(playerSplitCards());
    } catch(e){
        console.error(e);
    }
};

export const dealerTurn = () => async (dispatch, getState) => {
    try {
        let state = getState();
        let dealerHand = state.blackjack.blackjackData.dealerData.hand;

        // Dealer continues drawing cards until they stand or bust
        while (!dealerHand.stand && !dealerHand.bust) {
            dispatch(loadCardInProgress());

            // Draw a card for the dealer
            const response = await axios.get(`api/blackjack/draw?count=1`);
            const { cards } = response.data;
            const [ card ] = cards;

            // Dispatch action to update dealer's hand
            dispatch(dealerDrawCard(card));

            // Update the state to get the latest dealer hand status after drawing the card
            state = getState();
            dealerHand = state.blackjack.blackjackData.dealerData.hand;
        }

        dispatch(loadCardSuccess());

    } catch (e) {
        // Handle any errors during the process
        dispatch(loadCardFailure());
        console.error(e);
    }
};