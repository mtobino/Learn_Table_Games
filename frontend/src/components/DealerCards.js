import {
    getDealerFaceUpCard,
    getDealerHand, getDealerHandValue,
    hasDealerTurnEnded,
    hasPlayerTurnEnded
} from "../redux/selectors";
import { dealerTurn } from "../redux/thunks";
import {useEffect} from "react";
import {Card, CardContainer, WrapperContainer} from "./wrappers";
import {connect} from "react-redux";
import {getTrueCardValue} from "../ultility/blackjack-utility";

const DealerCards = ({playerTurnEnded, dealerHand, dealerPlay, dealerTurnEnded, dealerFaceUpCard, dealerHandValue}) => {
    useEffect(() => {
        if (playerTurnEnded) {
            dealerPlay()
        }
    }, [playerTurnEnded, dealerTurnEnded]);

    const startingHand = <>
        <Card
            src={dealerFaceUpCard.image}
            alt={`${dealerFaceUpCard.value} of ${dealerFaceUpCard.suit}`}
            index={0}
            key={0}
        />
        <Card
            src="https://deckofcardsapi.com/static/img/back.png"
            alt={"Blank Card"}
            index={1}
            key={1}
        />
    </>;
    const startingValue = getTrueCardValue(dealerFaceUpCard.value);
    return(
        <WrapperContainer>
            <CardContainer>
                {!playerTurnEnded ? startingHand  : (
                    dealerHand.cards.map((card, i) => (
                        <Card
                            key={i}
                            index={i}
                            src={card.image}
                            alt={`${card.value} of ${card.suit}`}
                        />
                    ))
                )}
            </CardContainer>
            <p>{!playerTurnEnded ? startingValue : dealerHandValue}</p>
        </WrapperContainer>
    )
///
}
const mapStateToProps = (state, ownProps) => ({
    playerTurnEnded: hasPlayerTurnEnded(state),
    dealerHand: getDealerHand(state),
    dealerTurnEnded: hasDealerTurnEnded(state),
    dealerFaceUpCard: getDealerFaceUpCard(state),
    dealerHandValue: getDealerHandValue(state)
});
const mapDispatchToProps = dispatch =>({
    dealerPlay: () => dispatch(dealerTurn()),
});

export default connect(mapStateToProps,mapDispatchToProps)(DealerCards);