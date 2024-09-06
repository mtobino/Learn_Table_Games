import styled from "styled-components";

export const CardContainer = styled.div`
    position: relative;
    width: 150px;
    height: 250px;
`;
export const Card = styled.img`
    position: absolute;
    width: 100%;
    top: 0;
    left: ${props => props.index * 25}px;
    z-index: ${props => props.index};
`;
export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; /* Center buttons horizontally */
    gap: 10px;
    margin-top: 10px;
`;
export const WrapperContainer = styled.div`
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: space-between; /* Evenly space between the card and button containers */
    height: 100%; /* Or adjust as needed */
    padding: 20px; /* Optional padding */
`;