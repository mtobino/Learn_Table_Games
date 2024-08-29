import {useEffect, useState} from "react";
import axios from "axios";

const BlackjackPage = () =>{
    const [cardDeckID, setCardDeckID] = useState('');

    useEffect( () => {
        async function fetchCardDeck() {
            const response = await axios.get('api/blackjack/get-deck');
            const { deck_id } = response.data;
            setCardDeckID(deck_id);
        }
        fetchCardDeck();
    }, []);

    return(
        <>
            <h1>Welcome to Blackjack!</h1>
            <p>Your card deck can be found here: {cardDeckID}</p>
        </>
    );
};
export default BlackjackPage;