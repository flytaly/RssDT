import styled from 'styled-components';

const StyledCard = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background: ${props => props.theme.cardBackground};
    color: ${props => props.theme.fontColor};
    width: ${props => props.theme.cardWidth}rem;
    min-width: ${props => props.theme.cardWidth / 2}rem;
    max-width: calc(100vw - 2rem);
    min-height: 20rem;
    margin: 2rem auto;
    border-radius: 10px;
`;

export default StyledCard;
