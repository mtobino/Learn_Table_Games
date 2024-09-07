import {
    RESET_GAME,
    PLAYER_STANDS,
    PLAYER_DRAW_CARD,
    PLAYER_SPLIT_CARDS,
    PLAYER_DOUBLE_DOWNS,
    DEALER_DRAW_CARD,
    LOAD_CARD_FAILURE,
    LOAD_CARD_IN_PROGRESS,
    LOAD_CARD_SUCCESS,
    LOAD_PLAYER_SUGGESTED_ACTION_IN_PROGRESS,
    LOAD_PLAYER_SUGGESTED_ACTION_SUCCESS
} from './actions';
import { calculatePossibleValues } from '../ultility/blackjack-utility';

const initialBlackjackPlayerData = {
    blackjack: false,
    hasSplit:false,
    hand:[
        {
            stand: false,
            bust: false,
            cards: [],
            handValue:[],
            hint:{
                recommendedAction: '',
                recommendedActionMessage:''
            }
        }
    ]
};
const initialBlackjackDealerData = {
    hand : {
        cards: [],
        handValue: [],
        stand: false,
        bust: false,
    },
    blackjack: false,
};
const initialState = {
    isLoading: false,
    blackjackData: {
        playerData: initialBlackjackPlayerData,
        dealerData: initialBlackjackDealerData
    }
};

export const blackjack = (state = initialState, actions) => {
    const { type, payload } = actions;

    switch (type) {
        case PLAYER_DRAW_CARD: {
            const { card, handNum } = payload;
            const updatedHandValue = calculatePossibleValues([...Array.from(state.blackjackData.playerData.hand[handNum].cards, card => card.value), card.value]);
            // Create a new hand array with the updated cards for the specified hand
            updatedHandValue.sort();
            const updatedHand = state.blackjackData.playerData.hand.map((hand, index) => {
                if (index === handNum) {
                    return {
                        ...hand,
                        cards: [...hand.cards, card],  // Add the new card to the cards array
                        handValue: updatedHandValue,
                        bust: updatedHandValue.every(value => value > 21),
                    };
                }
                return hand;
            });
            // Return the new state with the updated playerData
            return {
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: {
                        ...state.blackjackData.playerData,
                        blackjack: updatedHandValue.includes(21),
                        hand: updatedHand
                    }
                }
            };
        }
        case PLAYER_STANDS:{
            const { handNum } = payload;
            const updatedHand = state.blackjackData.playerData.hand.map((hand, index) => {
                if(index === handNum){
                    return {
                        ...hand,
                        stand: true
                    }
                }
                return hand;
            });

            return{
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: {
                        ...state.blackjackData.playerData,
                        hand: updatedHand
                    }
                }
            }
        }
        case PLAYER_SPLIT_CARDS:{
            // Split the current cards array into two if it has exactly two cards
            const currentHand = state.blackjackData.playerData.hand[0];
            const [firstCard, secondCard] = currentHand.cards;

            // Create two new hand objects, each with one of the cards
            const newHand1 = {
                stand: false,
                bust: false,
                cards: [firstCard],
                handValue: calculatePossibleValues([firstCard.value]),
                hint:{
                    recommendedAction: '',
                    recommendedActionMessage:''
                }
            };

            const newHand2 = {
                stand: false,
                bust: false,
                cards: [secondCard],
                handValue: calculatePossibleValues([secondCard.value]),
                hint:{
                    recommendedAction: '',
                    recommendedActionMessage:''
                }
            };

            // Update the hand array to include the two new hands
            const updatedHand = [
                newHand1,
                newHand2,
            ];

            return{
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: {
                        ...state.blackjackData.playerData,
                        hasSplit:true,
                        hand: updatedHand
                    }
                }
            }
        }
        case PLAYER_DOUBLE_DOWNS:{
            const { card } = payload;
            const updatedHandValue = calculatePossibleValues([...Array.from(state.blackjackData.playerData.hand[0].cards, card => card.value), card.value]);
            // Create a new hand array with the updated cards for the specified hand
            const updatedHand = state.blackjackData.playerData.hand.map((hand, index) => {
                if (index === 0) {
                    return {
                        ...hand,
                        cards: [...hand.cards, card],  // Add the new card to the cards array
                        stand: true,                   // force the player to stand
                        handValue: updatedHandValue
                    };
                }
                return hand;
            });

            // Return the new state with the updated playerData
            return {
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: {
                        ...state.blackjackData.playerData,
                        hand: updatedHand,
                    }
                }
            };

        }
        case DEALER_DRAW_CARD: {
            const { card } = payload;
            const updatedHandValue = calculatePossibleValues([...Array.from(state.blackjackData.dealerData.hand.cards, card => card.value), card.value]);
            updatedHandValue.sort();
            const updatedHand = {
                ...state.blackjackData.dealerData.hand,
                cards: [...state.blackjackData.dealerData.hand.cards, card],
                handValue: updatedHandValue,
                bust: updatedHandValue.every(value => value > 21),
                stand:updatedHandValue.includes(21)
            }
            return{
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    dealerData: {
                        ...state.blackjackData.dealerData,
                        hand: updatedHand,
                    }
                }
            }
        }
        // Reset the dealer and player to empty hands and values
        case RESET_GAME:{
            return{
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: initialBlackjackPlayerData,
                    dealerData: initialBlackjackDealerData
                }
            }
        }
        // Reducers to log that a card was being loaded in
        case LOAD_CARD_SUCCESS:
        case LOAD_CARD_FAILURE:
            return{
                ...state,
                isLoading: false
            }
        case LOAD_CARD_IN_PROGRESS:{
            return{
                ...state,
                isLoading: true
            }
        }
        case LOAD_PLAYER_SUGGESTED_ACTION_IN_PROGRESS:{
            return {
                ...state,
                isLoading: true
            }
        }
        case LOAD_PLAYER_SUGGESTED_ACTION_SUCCESS:{
            const {handNum, suggestedAction} = payload;
            const updatedHand = state.blackjackData.playerData.hand.map((hand, index) =>{
                if(index === handNum){
                    let { recommendedAction, recommendedActionMessage } = suggestedAction;
                    return{
                        ...hand,
                        hint:{
                            ...hand.hint,
                            recommendedActionMessage: recommendedActionMessage,
                            recommendedAction: recommendedAction
                        }

                    }
                }
                return hand;
            });
            return{
                ...state,
                blackjackData: {
                    ...state.blackjackData,
                    playerData: {
                        ...state.blackjackData.playerData,
                        hand: updatedHand
                    }
                }
            }
        }
        default:
            return state;
    }
}

