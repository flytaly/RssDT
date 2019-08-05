import styled from 'styled-components';

const StyledCard = styled.div`
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background: ${props => props.theme.cardBackground};
    color: ${props => props.theme.fontColor};
    width: ${props => props.theme.cardWidth}rem;
    min-width: ${props => props.theme.cardWidth / 2}rem;
    max-width: calc(100vw - 2rem);
    min-height: 40rem;
    margin: 1rem auto;
    border-radius: 10px;
`;

const WelcomeStyledCard = styled(StyledCard)`
    background: rgba(255, 255, 255, 0.88);
    &:before {
        content: " ";
        position: absolute;
        border-radius: 10px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background: ${props => props.theme.welcomeCardBackground};
        }
`;

export default StyledCard;
export { WelcomeStyledCard };
