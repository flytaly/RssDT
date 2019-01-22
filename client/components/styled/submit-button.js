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
`;

export default SubmitButton;
