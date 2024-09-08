import {connect, useSelector} from "react-redux";
import {getPlayerHand, getPlayerRecommendedActionMessage} from "../redux/selectors";
import styled from 'styled-components';
import PlayerCardsHolder from "./PlayerCardsHolder";
import {useState} from "react";


const PlayerWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center; /* Evenly space between the card and button containers */
    height: 100%; /* Or adjust as needed */
    padding: 20px; /* Optional padding */
`
//TODO: Might have to eventually make a wrapper to the wrapper container for when the player splits their cards
const PlayerCards = ({ playerHand }) => {
    const [activeHand, setActiveHand] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const hintMessage = useSelector((state) => getPlayerRecommendedActionMessage(state, activeHand));
    const hint = <>
        <p>{hintMessage}</p>
        <button onClick={() => setShowHint(false)}>Hide Hint</button>
    </>
    return (
        <>
            <PlayerWrapper>
                {playerHand.map((hand, i) => (
                    <PlayerCardsHolder
                        key={i}
                        hand={hand}
                        index={i}
                        activeHand={activeHand}
                        setActiveHand={setActiveHand}
                        setShowHint={setShowHint}
                    />
                ))}
            </PlayerWrapper>
            <>
                {showHint && hint}
            </>
        </>
    );
}
const mapStateToProps = (state) => ({
    playerHand: getPlayerHand(state),
});

export default connect(mapStateToProps)(PlayerCards);