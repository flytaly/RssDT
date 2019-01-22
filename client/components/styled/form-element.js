import styled, { withTheme } from 'styled-components';

// use as to change div to input, select, etc..
// https://www.styled-components.com/docs/api#as-polymorphic-prop
const FormElement = styled.div`
    flex: 1 0 auto;
    margin-left: 0.5rem;
    height: 100%;
    font-size: 1.6rem;
    border: none;
    outline: none;
    background-color: ${props => props.theme.greyMedium};
`;

export default withTheme(FormElement);
