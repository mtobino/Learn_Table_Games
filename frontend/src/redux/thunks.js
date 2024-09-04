import {
    loadDeckSuccess,
    loadDeckInProgress,
    loadDeckFailure,
    playerDrawCard,
    playerStands,
    playerSplitCards,
    playerDoubleDowns,
    dealerDrawCard
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
}