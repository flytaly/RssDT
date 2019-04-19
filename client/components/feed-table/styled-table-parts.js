import styled from 'styled-components';

export const Table = styled.ul`
    margin: 0px;
    padding: 0px;
    font-size: 1.4rem;
`;
export const Tr = styled.li`
    list-style: none;
    display: grid;
    grid-template-columns: 4fr 1fr 2fr 2fr 1fr;
    grid-gap: 5px;
    align-items: center;
    margin-bottom: 0.5rem;
    &:hover:not(:first-of-type) {
        outline: ${props => props.theme.tableHoverColor} 1px solid;
        background-color: ${props => props.theme.tableHoverColor};
    }
    @media all and (max-width: 34em) { // ~ 544px if em=16px
        grid-template-columns: 1fr;
        margin-bottom: 1rem;
        :nth-child(2n+1):not(:first-of-type):not(:hover){
            background-color: ${props => props.theme.tableAltRowColor};
        }
    }
`;

export const Td = styled.div`
    min-width: ${props => props.minWidth || '10rem'};
    word-break: break-all;
    @media all and (max-width: 34em) {
        :before {
            content: attr(data-name);
            font-size: 1.5rem;
            font-weight: bold;
        }
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: 5px;
    }
`;

export const Th = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    min-width: ${props => props.minWidth || '10rem'};
    @media all and (max-width: 34em) {
        display: none;
    }
`;

export const Img = styled.img`
    height: 1.5rem;
`;

export const Button = styled.button`
    border: none;
    padding: 0;
    margin: 0 0.5rem 0 0;
    background: none;
    cursor: pointer;
    text-align: center;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    :focus,
    :hover{
        transform: scale(1.05);
    }
    :active{
        transform: scale(0.95);
    }
`;
export const ButtonWithImg = props => <Button><Img {...props} /></Button>;
