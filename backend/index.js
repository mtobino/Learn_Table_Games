const axios = require('axios');
const readline = require('node:readline');
function calculatePossibleValues(hand) {
    let totalWithoutAces = 0;
    let aceCount = 0;
    let possibleValues = new Set();

    hand.forEach(card => {
        const value = card.value;
        if (value === "KING" || value === "QUEEN" || value === "JACK") {
            totalWithoutAces += 10;
        } else if (value === "ACE") {
            aceCount++;
        } else {
            totalWithoutAces += parseInt(value, 10); // For number cards
        }
    });

    // Generate all possible values considering Ace(s)
    for (let i = 0; i <= aceCount; i++) {
        let total = totalWithoutAces + (aceCount - i) * 11 + i;
        possibleValues.add(total);
    }

    return Array.from(possibleValues);
}
const getCardDeck= async () => {
    try{
        const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6');
        console.log("New card deck gotten");
        return response.data;
    }catch(e){
        console.error(e);
    }
}

function displayResults(player, dealer){
    if(player.Hit21 && dealer.Hit21){
        console.log("Both hit 21: Push!");
    }
    else if(player.Hit21 && !dealer.Hit21){
        console.log("Player wins with 21!");
    }
    else if(dealer.Hit21 && !player.Hit21){
        console.log("Dealer wins with 21!");
    }
    else if(dealer.Bust){
        console.log("Player wins, Dealer busted!");
    }
    else if(player.Bust){
        console.log("Player busted :(");
    }
    else if(player.EqualToOrOver17 && dealer.EqualToOrOver17){
        let playerMax = player.handValue.filter(value => value < 21).sort((a, b) => b - a)[0];
        let dealerMax = dealer.handValue.filter(value => value < 21).sort((a, b) => b - a)[0];
        if(playerMax > dealerMax){
            console.log(`Player wins with ${playerMax}, dealers has ${dealerMax}`);
        }
        else if(playerMax === dealerMax){
            console.log("Push!")
        }
        else{
            console.log(`Dealer wins with ${dealerMax}, player has ${playerMax}`);
        }
    }

    console.log(player.handValue);
    console.log(dealer.handValue);
}



const playRound = async () => {
    let { deck_id } = await getCardDeck();
    let dealer = {
        cards : [],
        Hit21: false,
        EqualToOrOver17: false,
        Bust: false,
        handValue: []
    };
    let player = {
        cards : [],
        Hit21: false,
        EqualToOrOver17: false,
        Bust: false,
        handValue: []
    };
    let drawnCards = await dealCard(deck_id);
    let oscillator = true;
    drawnCards.forEach(card => {
        if(oscillator){
            player.cards.push(card);
        }
        else{
            dealer.cards.push(card);
        }
        oscillator = !oscillator;
    });
    let playerValueCalc = calculatePossibleValues(player.cards);
    let dealerValueCalc = calculatePossibleValues(dealer.cards);
    fixPlayer(player, playerValueCalc);
    fixPlayer(dealer, dealerValueCalc);
    console.log(`Player starts with: ${player.cards[0].value} and ${player.cards[1].value}`);
    console.log(`Dealer starts with: ${dealer.cards[0].value} and ${dealer.cards[1].value}`);

    while( !player.Bust && !player.Hit21 && !player.EqualToOrOver17 && !dealer.Hit21 )
    {
        let newCard = await dealSingleCard(deck_id);
        console.log(`Player received a ${newCard[0].value}`);
        player.cards.push(newCard[0]);
        playerValueCalc = calculatePossibleValues(player.cards);
        fixPlayer(player, playerValueCalc);
    }

    while( !player.Bust && !dealer.Hit21 && !dealer.EqualToOrOver17 && !dealer.Bust){
         let newCard = await dealSingleCard(deck_id);
         console.log(`Dealer received a ${newCard[0].value}`);
         dealer.cards.push(newCard[0]);
         dealerValueCalc = calculatePossibleValues(dealer.cards);
         fixPlayer(dealer, dealerValueCalc)
    }
    displayResults(player, dealer);

}
function fixPlayer (player, playerValueCalc){
    player.EqualToOrOver17 = playerValueCalc.filter(value =>  value >= 17 && value < 21).length > 0;
    player.Hit21 = playerValueCalc.includes(21);
    player.Bust = playerValueCalc.every(value => value > 21);
    player.handValue = playerValueCalc;
}

const dealSingleCard = async (deck_id) =>{
    try{
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`);
        const { cards } = response.data;
        return cards;
    } catch (e) {
        console.error(e);
    }
}
const dealCard = async (deck_id) =>{
    try{
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=4`);
        const { cards } = response.data;
        return cards;
    } catch (e) {
        console.error(e);
    }
}

playRound();