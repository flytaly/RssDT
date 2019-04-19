import styled from 'styled-components';

export const SubmitButton = styled.button`
    width: 100%;
    height: 4.5rem;
    margin-top: 1rem;
    background-color: ${props => props.theme.btnColor1};
    color: #FFFFFF;
    border-radius: 20px;
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
        border: 1px solid ${props => props.theme.btnColor1};
        box-shadow: 0 0 1.5rem ${props => props.theme.btnColor1};
    }
    :active:not(:disabled){
        transform: scale(0.96);
    }
`;


export const DeleteButton = styled.button`
    background-color: hsl(10, 67%, 56.9%);
    color: white;
    padding: 0.6rem;
    border: none;
    text-align: center;
    :focus,
    :hover{
        background-color: hsl(10, 67%, 45%);
    }
    :active{
        color: hsl(10, 67%, 90%);
    }
`;

export const CancelButton = styled.button`
    background-color: hsl(0, 0%, 60%);
    color: white;
    padding: 0.6rem;
    border: none;
    text-align: center;
    :focus,
    :hover{
        background-color: hsl(0, 0%, 45%);
    }
    :active{
        color: hsl(0, 0%, 90%);
    }
`;
