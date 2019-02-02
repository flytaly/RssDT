import styled from 'styled-components';

const SubmitButton = styled.button`
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
    :active{
        transform: scale(0.96);
    }
`;

export default SubmitButton;
