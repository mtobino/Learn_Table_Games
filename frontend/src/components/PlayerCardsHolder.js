import {ButtonContainer, Card, CardContainer, WrapperContainer} from "./wrappers";
import {getDealerFaceUpCard, getPlayerCardValuesAsString, getPlayerRecommendedActionMessage} from "../redux/selectors";
import {doublesDown, getPlayerSuggestedAction, playerDrawsACard, playerStand} from "../redux/thunks";
import {connect, useSelector} from "react-redux";
import {useState} from "react";

const PlayerCardsHolder = ({ hand, index, hit, stand, dealerFaceUpCard, hint, hintMessage, playerCardsAsString, doubleDown }) =>{
    const [showHint, setShowHint] = useState(false);
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
                        hint(index, playerCardsAsString, dealerFaceUpCard);
                        setShowHint(true);
                    }}>Hint</button>
                    <button onClick={() => doubleDown()}>Double Down</button>
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
    playerCardsAsString : getPlayerCardValuesAsString(state, ownProps.index),
    hintMessage: getPlayerRecommendedActionMessage(state, ownProps.index)
});
const mapDispatchToProps = dispatch =>({
    hit: (handNum) => dispatch(playerDrawsACard(handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
    hint: (handNum, playerCards, dealerCard) => dispatch(getPlayerSuggestedAction(handNum, playerCards, dealerCard)),
    doubleDown: () => dispatch(doublesDown()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerCardsHolder);