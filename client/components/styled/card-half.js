import styled, { withTheme } from 'styled-components';

const StyledHalf = styled.div`
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    width: 50%;
    min-width: ${props => props.theme.cardWidth / 2}rem;
    max-width: calc(100vw - 2rem);
    padding: 1rem 3rem;
`;

export default withTheme(StyledHalf);
