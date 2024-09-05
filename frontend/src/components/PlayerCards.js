import {connect} from "react-redux";
import {getDeckId, getPlayerHand, getSpecificPlayerHandValuesAsString} from "../redux/selectors";
//import Card from "./Card";
import {playerDrawsACard, playerStand} from "../redux/thunks";
import styled from 'styled-components';

const CardContainer = styled.div`
    position: relative;
    width: 150px;
    height: 250px;
`;
const Card = styled.img`
    position: absolute;
    width: 100%;
    top: 0;
    left: ${props => props.index * 25}px;
    z-index: ${props => props.index};
`;
const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; /* Center buttons horizontally */
    gap: 10px;
    margin-top: 10px;
`;
const WrapperContainer = styled.div`
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: space-between; /* Evenly space between the card and button containers */
    height: 100%; /* Or adjust as needed */
    padding: 20px; /* Optional padding */
`;
//TODO: Might have to eventually make a wrapper to the wrapper container for when the player splits their cards
const PlayerCards = ({ playerHand, deckId, hit, stand }) => {
    return (
        <WrapperContainer>
            <CardContainer>
                {playerHand.map((hand, i) => (
                        <div key={i}>
                            {hand.cards.map((card, index) => (
                                <Card
                                    key={index}
                                    src={card.images.png}
                                    alt={`${card.value} of ${card.suit}`}
                                    index={index}
                                />
                            ))}
                        </div>
                ))}
            </CardContainer>
            <>
                {playerHand.map((hand, i) => (
                    <div key={i}>
                        <p>{hand.handValue.filter(value => value <= 21).length > 1 ? hand.handValue[0] + "/" + hand.handValue[1] : hand.handValue[0] + ""}</p>
                    </div>
                ))}
            </>
            {playerHand.map((hand, i) => (
                !hand.handValue.every(value => value > 21) && !hand.stand && (
                    <ButtonContainer key={i}>
                        <button onClick={() => hit(deckId, i)}>Hit</button>
                        <button onClick={() => stand(i)}>Stand</button>
                    </ButtonContainer>
                )
            ))}
        </WrapperContainer>
    )
}
const mapStateToProps = (state) => ({
    playerHand: getPlayerHand(state),
    deckId: getDeckId(state),

});
const mapDispatchToProps = dispatch =>({
    hit: (deckId, handNum) => dispatch(playerDrawsACard(deckId, handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
});

export default connect(mapStateToProps,mapDispatchToProps)(PlayerCards);