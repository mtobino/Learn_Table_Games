import {ButtonContainer, Card, CardContainer, WrapperContainer} from "./wrappers";
import {getDealerFaceUpCard } from "../redux/selectors";
import {getPlayerSuggestedAction, playerDrawsACard, playerStand} from "../redux/thunks";
import {connect, useSelector} from "react-redux";
import {useState} from "react";

const PlayerCardsHolder = ({ hand, index, hit, stand, dealerFaceUpCard, hint }) =>{
    const [showHint, setShowHint] = useState(false);
    const hintMessage = useSelector(state => state.blackjack.blackjackData.playerData.hand[index].hint.recommendedActionMessage);
    const playerCardValuesAsString = useSelector(state =>{
        let hand = state.blackjack.blackjackData.playerData.hand[index];
        let playerCards = hand.cards[0].value + '';
        let len = hand.cards.length;
        for(let i = 1; i < len; i++) {
            playerCards = playerCards.concat(","+hand.cards[i].value);
        }
        return playerCards;
    });
    return (
        <WrapperContainer>
            <CardContainer>
                {hand.cards.map((card, i) => (
                    <Card
                        key={i}
                        src={card.images.png}
                        alt={`${card.value} of ${card.suit}`}
                        index={i}
                    />
                ))}
            </CardContainer>
            <>
                <p>{hand.handValue.filter(value => value <= 21).length > 1 ? hand.handValue[0] + "/" + hand.handValue[1] : hand.handValue[0] + ""}</p>
            </>
            {!hand.handValue.every(value => value > 21) && !hand.stand && (
                <ButtonContainer>
                    <button onClick={() => hit(index)}>Hit</button>
                    <button onClick={() => stand(index)}>Stand</button>
                    <button onClick={() => {
                        let playerCards = hand.cards[0].value + '';
                        let len = hand.cards.length;
                        for(let i = 1; i < len; i++) {
                            playerCards = playerCards.concat(","+hand.cards[i].value);
                        }
                        hint(index, playerCards, dealerFaceUpCard);
                        setShowHint(true);
                    }}>Hint</button>
                </ButtonContainer>)
            }
            {showHint &&
                <>
                    <p>{hintMessage}</p>
                    <button onClick={() => setShowHint(false)}>Hide hint</button>
                </>
            }
        </WrapperContainer>
    )
}
const mapStateToProps = (state, ownProps) => ({
    dealerFaceUpCard : getDealerFaceUpCard(state),
});
const mapDispatchToProps = dispatch =>({
    hit: (handNum) => dispatch(playerDrawsACard(handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
    hint: (handNum, playerCards, dealerCard) => dispatch(getPlayerSuggestedAction(handNum, playerCards, dealerCard))
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerCardsHolder);