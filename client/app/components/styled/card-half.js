import styled from 'styled-components';

const StyledLightHalf = styled.div`
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    width: 50%;
    min-width: ${props => props.theme.cardWidth / 2}rem;
    max-width: calc(100vw - 2rem);
    padding: 1rem 3rem;
`;

const StyledDarkHalf = styled(StyledLightHalf)`
    background: ${props => props.theme.greyLight};
    border: 1px solid ${props => props.theme.greyDark};
    border-radius: 10px;
`;

export { StyledLightHalf, StyledDarkHalf };
