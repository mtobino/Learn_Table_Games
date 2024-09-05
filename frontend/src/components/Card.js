import { ReactSVG } from 'react-svg';

const Card = ({ card }) =>{
    return(
        <>
            <ReactSVG src={card.images.svg}/>
        </>
    )
};
export default Card;