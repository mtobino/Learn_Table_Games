import {
    PLAYER_STANDS,
    PLAYER_DRAW_CARD,
    PLAYER_SPLIT_CARDS,
    PLAYER_DOUBLE_DOWNS,
    DEALER_DRAW_CARD,
    LOAD_DECK_FAILURE,
    LOAD_DECK_IN_PROGRESS,
    LOAD_DECK_SUCCESS
} from './actions';
import { calculatePossibleValues } from '../ultility/blackjack-utility';

const initialBlackjackPlayerData = {
    blackjack: false,
    hand:[
        {
            stand: false,
            bust: false,
            cards: [],
            handValue:[]
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
    deckId: '',
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
            const updatedHand = state.blackjackData.playerData.hand.map((hand, index) => {
                if (index === handNum) {
                    return {
                        ...hand,
                        cards: [...hand.cards, card],  // Add the new card to the cards array
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
                handValue: calculatePossibleValues([firstCard.value]) // Assuming cards have a `value` property
            };

            const newHand2 = {
                stand: false,
                bust: false,
                cards: [secondCard],
                handValue: calculatePossibleValues([secondCard.value]) // Assuming cards have a `value` property
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
            const updatedHand = {
                ...state.blackjackData.dealerData.hand,
                cards: [...state.blackjackData.dealerData.hand.cards, card],
                handValue: updatedHandValue
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
        case LOAD_DECK_SUCCESS:{
            const { deckId } = payload;
            return{
                ...state,
                isLoading: false,
                deckId: deckId
            }
        }
        case LOAD_DECK_FAILURE:{
            return{
                ...state,
                isLoading: false
            }
        }
        case LOAD_DECK_IN_PROGRESS:{
            return{
                ...state,
                isLoading: true
            }
        }
        default:
            return state;
    }
}

