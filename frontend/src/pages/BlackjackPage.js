import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {resetTheGame, startTheGame} from "../redux/thunks";
import {isLoading} from "../redux/selectors";
import PlayerCards from "../components/PlayerCards";
import DealerCards from "../components/DealerCards";

const BlackjackPage = ({ beginGame, resetGame }) =>{

    const [reset , setReset] = useState(true);

    useEffect( () => {
        if(reset){
            resetGame();
        }
        else{
            beginGame();
        }
    }, [reset]);
    //TODO: have a spinner appear between loading each card
    const game = <>
        <DealerCards/>
        <PlayerCards/>
    </>
    return (
        <>
            <h1>Welcome to Blackjack!</h1>
            <button onClick={() => setReset(false)}>
                Start Game
            </button>
            <button onClick={() => setReset(true)}>
                Reset Game
            </button>
            {!reset && game}
        </>
    );
};

const mapStateToProps = state =>({

});
const mapDispatchToProps = dispatch =>({
    beginGame: () => dispatch(startTheGame()),
    resetGame: () => dispatch(resetTheGame()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BlackjackPage);