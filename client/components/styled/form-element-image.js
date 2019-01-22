import styled, { css } from 'styled-components';

const FormElementImage = styled.div`
    width: 2rem;
    height: 2rem;
    ${props => props.src && css`background: center / contain no-repeat url('${props.src}');`}
`;

export default FormElementImage;
