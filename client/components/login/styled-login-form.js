import styled from 'styled-components';

const StyledForm = styled.form.attrs({
    method: 'POST',
})`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
    h2 {
        align-self: center;
    }
    a {
        color: ${props => props.theme.fontColor};
        font-size: 1.3rem;
        text-align: right;
    }
`;

export default StyledForm;
