import {connect} from "react-redux";
import {getPlayerHand} from "../redux/selectors";
import {playerDrawsACard, playerStand} from "../redux/thunks";
import styled from 'styled-components';
import PlayerCardsHolder from "./PlayerCardsHolder";


const PlayerWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center; /* Evenly space between the card and button containers */
    height: 100%; /* Or adjust as needed */
    padding: 20px; /* Optional padding */
`
//TODO: Might have to eventually make a wrapper to the wrapper container for when the player splits their cards
const PlayerCards = ({ playerHand, hit, stand }) => {
    return (
        <PlayerWrapper>
            {playerHand.map((hand, i) => (
                <PlayerCardsHolder
                    key={i}
                    hand={hand}
                    index={i}
                    hit={hit}
                    stand={stand}
                />
            ))}
        </PlayerWrapper>
    );
}
const mapStateToProps = (state) => ({
    playerHand: getPlayerHand(state),
});
const mapDispatchToProps = dispatch =>({
    hit: (handNum) => dispatch(playerDrawsACard(handNum)),
    stand: (handNum) => dispatch(playerStand(handNum)),
});

export default connect(mapStateToProps,mapDispatchToProps)(PlayerCards);