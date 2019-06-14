import styled, { css } from 'styled-components';

export const SubmitButton = styled.button`
    width: 100%;
    padding: 1rem 0;
    margin-top: 1rem;
    background-color: ${props => props.theme.btnColor1};
    color: #FFFFFF;
    border-radius: 20px;
    border: 1px solid ${props => props.theme.btnColor1};
    font-size: 2rem;
    cursor: pointer;
    :disabled,
    [disabled] {
        background-color: ${props => props.theme.btnColor1Disable};
        cursor: default;

    }
    :focus,
    :hover:not(:disabled) {
        outline: none;
        box-shadow: 0 0 1.5rem ${props => props.theme.btnColor1};
    }
    :active:not(:disabled){
        transform: scale(0.96);
    }
`;

export const removeButtonStylesMixin = css`
    border: none;
    padding: 0;
    background: none;
    text-align: center;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
`;

export const scaleOnHoverActiveMixin = css`
    :focus,
    :hover{
        transform: scale(1.10);
    }
    :focus:hover{
        outline: none;
    }
    :active{
        transform: scale(0.95);
    }
`;

export const NoStylesButton = styled.button.attrs({ type: 'button' })`
    ${removeButtonStylesMixin}
    ${scaleOnHoverActiveMixin}
`;

export const InlineTextButton = styled.button`
    ${removeButtonStylesMixin}
    font-size: inherit;
    color: ${props => props.theme.greyDark};
    text-decoration: underline dotted;
    :hover {
        text-decoration: underline;
    }
    :active:not(:disabled){
        color: inherit;
    }
    :disabled {
        text-decoration: none;
    }
`;

export const Button = styled.button.attrs({ type: 'button' })`
    background-color: hsl(0, 0%, 60%);
    color: white;
    padding: 0.6rem 1rem;
    border: none;
    text-align: center;
    text-transform: uppercase;
    border-radius: 5px;
    min-width: 7rem;
    font-size: 1.3rem;
    user-select:none;
    :focus,
    :hover{
        background-color: hsl(0, 0%, 45%);
    }
    :active{
        color: hsl(0, 0%, 90%);
    }
`;

export const DeleteButton = styled(Button).attrs({ type: 'button' })`
    background-color: hsl(10, 67%, 56.9%);
    :focus,
    :hover{
        background-color: hsl(10, 67%, 45%);
    }
    :active{
        color: hsl(10, 67%, 90%);
    }
    :disabled {
        color: black;
        background-color: hsl(10, 67%, 90%);
    }
`;

export const GreenButtonLink = styled(Button).attrs({ as: 'a' })`
    display: block;
    background-color: hsl(155, 88%, 33%);
    :focus,
    :hover{
        background-color: hsl(155, 88%, 23%);
    }
    :active{
        color: hsl(155, 88%, 43%);
    }
`;

export const BlueButton = styled(Button).attrs({ type: 'button' })`
    background-color: hsl(200, 100%, 40%);
    :focus,
    :hover{
        background-color: hsl(200, 100%, 30%);
    }
    :active{
        color: hsl(200, 100%, 60%);
    }
`;


export const CancelButton = styled(Button)`

`;
