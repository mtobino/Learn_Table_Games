import {ButtonContainer, Card, CardContainer, WrapperContainer} from "./wrappers";

const PlayerCardsHolder = ({ hand, index, stand, hit }) =>{
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
            {!hand.handValue.every(value => value > 21) && !hand.stand && (
                <ButtonContainer>
                    <button onClick={() => hit(index)}>Hit</button>
                    <button onClick={() => stand(index)}>Stand</button>
                </ButtonContainer>
            )}
        </WrapperContainer>
    )
}

export default PlayerCardsHolder;