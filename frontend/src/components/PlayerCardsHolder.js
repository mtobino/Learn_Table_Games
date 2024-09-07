import {ButtonContainer, Card, CardContainer, WrapperContainer} from "./wrappers";
import {
    canSplitHand,
    getDealerFaceUpCard,
    getPlayerCardValuesAsString,
    getPlayerRecommendedActionMessage, hasPlayerSpecificHandTurnEnded,
    hasPlayerSplit
} from "../redux/selectors";
import {doublesDown, getPlayerSuggestedAction, playerDrawsACard, playerStand, split} from "../redux/thunks";
import {connect} from "react-redux";
import {useEffect, useState} from "react";

const PlayerCardsHolder = ({ hand, index, activeHand, setActiveHand, hit, stand, dealerFaceUpCard, hint, hintMessage, playerCardsAsString, doubleDown, hasSplit, splitCards, turnEnd, canSplit}) =>{
    const [showHint, setShowHint] = useState(false);
    useEffect(() => {
        if(hasSplit && index === activeHand){
            hit(index)
        }
    }, [activeHand, index, hasSplit]);
    useEffect(() =>{
        if(turnEnd){
            setActiveHand(activeHand + 1);
        }
    }, [turnEnd]);
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
            {activeHand === index && !hand.bust && !hand.stand && (
                <ButtonContainer>
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
    hintMessage: getPlayerRecommendedActionMessage(state, ownProps.index),
    hasSplit: hasPlayerSplit(state),
    turnEnd: hasPlayerSpecificHandTurnEnded(state, ownProps.index),
    canSplit: canSplitHand(state, ownProps.index)
});
const mapDispatchToProps = dispatch =>({
    hit: (handNum) => dispatch(playerDrawsACard(handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
    hint: (handNum, playerCards, dealerCard, hasSplit) => dispatch(getPlayerSuggestedAction(handNum, playerCards, dealerCard, hasSplit)),
    doubleDown: () => dispatch(doublesDown()),
    splitCards: () => dispatch(split()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerCardsHolder);