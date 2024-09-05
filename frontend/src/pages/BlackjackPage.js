import { useEffect } from "react";
import { connect } from "react-redux";
import { loadDeck, startTheGame, resetTheGame } from "../redux/thunks";
import { getDeckId, isLoading} from "../redux/selectors";
import PlayerCards from "../components/PlayerCards";

const BlackjackPage = ({ startLoadingDeck, deckId, isLoading, beginGame, reset }) =>{

    useEffect( () => {
        startLoadingDeck();
        reset(deckId);
        beginGame(deckId);
    }, []);
    const content = (
        <>
            <h1>Welcome to Blackjack!</h1>
            <p>Your card deck can be found here: {deckId}</p>
            <PlayerCards/>
        </>
    );
    const loadingMessage = <div>Loading...</div>
    return isLoading ? loadingMessage : content;
};

const mapStateToProps = state =>({
    deckId: getDeckId(state),
    isLoading: isLoading(state),
});
const mapDispatchToProps = dispatch =>({
    startLoadingDeck: () => dispatch(loadDeck()),
    beginGame: (deckId) => dispatch(startTheGame(deckId)),
    reset: (deckId) => dispatch(resetTheGame(deckId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BlackjackPage);