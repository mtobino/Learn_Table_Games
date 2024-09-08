import {ButtonContainer, Card, CardContainer, WrapperContainer} from "./wrappers";
import {
    canSplitHand,
    getDealerFaceUpCard,
    getPlayerCardValuesAsString, getPlayerHandValue,
    hasPlayerSpecificHandTurnEnded,
    hasPlayerSplit
} from "../redux/selectors";
import {doublesDown, getPlayerSuggestedAction, playerDrawsACard, playerStand, split} from "../redux/thunks";
import {connect} from "react-redux";
import {useEffect} from "react";

const PlayerCardsHolder = ({ hand, index, activeHand, setActiveHand, setShowHint, hit, stand, dealerFaceUpCard, hint, playerCardsAsString, doubleDown, hasSplit, splitCards, turnEnd, canSplit, playerHandValue}) =>{
    useEffect(() => {
        if(hasSplit && index === activeHand){
            setShowHint(false)
            hit(index)
        }
    }, [activeHand, index, hasSplit]);
    useEffect(() =>{
        if(turnEnd){
            setActiveHand(activeHand + 1);
        }
    }, [turnEnd]);
    const buttons = <ButtonContainer>
        <button onClick={() => hit(index)}>Hit</button>
        <button onClick={() => stand(index)}>Stand</button>
        <button onClick={() => doubleDown()}>Double Down</button>
        {!hasSplit && canSplit &&
            <button onClick={() => splitCards()}>
                Split
            </button>
        }
        <button onClick={() => {
            hint(index, playerCardsAsString, dealerFaceUpCard, hasSplit);
            setShowHint(true);
        }}>
            Hint
        </button>
    </ButtonContainer>
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
                <p>{playerHandValue}</p>
            </>
            { activeHand === index && !hand.bust && !hand.stand && buttons }
        </WrapperContainer>
    )
}
const mapStateToProps = (state, ownProps) => ({
    dealerFaceUpCard : getDealerFaceUpCard(state),
    playerCardsAsString : getPlayerCardValuesAsString(state, ownProps.index),
    hasSplit: hasPlayerSplit(state),
    turnEnd: hasPlayerSpecificHandTurnEnded(state, ownProps.index),
    canSplit: canSplitHand(state, ownProps.index),
    playerHandValue : getPlayerHandValue(state, ownProps.index)
});
const mapDispatchToProps = dispatch =>({
    hit: (handNum) => dispatch(playerDrawsACard(handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
    hint: (handNum, playerCards, dealerCard, hasSplit) => dispatch(getPlayerSuggestedAction(handNum, playerCards, dealerCard, hasSplit)),
    doubleDown: () => dispatch(doublesDown()),
    splitCards: () => dispatch(split()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerCardsHolder);