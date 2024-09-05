import {
    loadDeckSuccess,
    loadDeckInProgress,
    loadDeckFailure,
    playerDrawCard,
    playerStands,
    playerSplitCards,
    playerDoubleDowns,
    dealerDrawCard,
    loadCardSuccess,
    loadCardInProgress,
    loadCardFailure,
    resetGame
} from './actions';
import axios from "axios";

export const loadDeck = () => async (dispatch, getState)=>{
    try{
        dispatch(loadDeckInProgress());
        const response = await axios.get('api/blackjack/get-deck');
        const { deck_id } = response.data;
        dispatch(loadDeckSuccess(deck_id));
    }catch(error){
        dispatch(loadDeckFailure());
        console.log(error);
    }
};

export const startTheGame = (deckId) => async (dispatch, getState) =>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw/${deckId}?count=4`);
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
    } catch (e) {
        dispatch(loadCardFailure());
        console.error(e);
    }
}

export const resetTheGame = (deckId) => async (dispatch, getState)=>{
    try{
        await axios.put(`api/blackjack/shuffle/${deckId}`);
        dispatch(resetGame());
    } catch (e) {
        console.error(e);
    }
}

export const playerDrawsACard = (deckId, handNum) => async (dispatch, getState)=>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw/${deckId}?count=1`);
        const { cards } = response.data;
        const [ card ] = cards;
        dispatch(playerDrawCard(card, handNum));
        dispatch(loadCardSuccess());
    } catch (e) {
        dispatch(loadCardFailure());
        console.log(e);
    }
};
export const playerStand = (handNum) => (dispatch, getState)=>{
    dispatch(playerStands(handNum));
}

export const dealerDrawsACard = (deckId) => async (dispatch, getState)=>{
    try{
        dispatch(loadCardInProgress());
        const response = await axios.get(`api/blackjack/draw/${deckId}?count=1`);
        const { cards } = response.data;
        const [ card ] = cards;
        dispatch(dealerDrawCard(card));
        dispatch(loadCardSuccess());
    } catch (e) {
        dispatch(loadCardFailure());
        console.log(e);
    }
};