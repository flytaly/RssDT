import styled, { withTheme } from 'styled-components';

const FormElementContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 4.5rem;
    max-width: 100%;
    padding: 1rem;
    margin-bottom: 2rem;
    background-color: ${props => props.theme.greyMedium};
    border: ${props => (props.focus
        ? `2px solid ${props.theme.btnColor1}`
        : `1px solid ${props.theme.greyDark}`)};
    border-radius: 30px;
    :hover {
        border-width: 2px;
    }
`;

export default withTheme(FormElementContainer);
