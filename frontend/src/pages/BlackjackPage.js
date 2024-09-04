import { useEffect } from "react";
import { connect } from "react-redux";
import { loadDeck } from "../redux/thunks";
import { getDeckId, isLoading} from "../redux/selectors";

const BlackjackPage = ({ startLoadingDeck, deckId, isLoading }) =>{

    useEffect( () => {
        startLoadingDeck();
    }, []);
    const content = (
        <>
            <h1>Welcome to Blackjack!</h1>
            <p>Your card deck can be found here: {deckId}</p>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(BlackjackPage);