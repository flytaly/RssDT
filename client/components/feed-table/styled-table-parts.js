import styled from 'styled-components';
import PropTypes from 'prop-types';
import { NoStylesButton } from '../styled/buttons';

export const Table = styled.ul`
    margin: 0px;
    padding: 0px;
    font-size: 1.3rem;
`;
export const Tr = styled.li`
    list-style: none;
    display: grid;
    grid-template-columns: 6fr 2fr 4fr 4fr 1fr;
    grid-gap: 5px;
    align-items: center;
    padding: 0.4rem 0;
    &:hover:not(:first-of-type) {
        outline: ${props => props.theme.tableHoverColor} 1px solid;
        background-color: ${props => props.theme.tableHoverColor};
    }
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        grid-template-columns: 1fr;
        padding: 1rem 0;
        :nth-child(2n+1):not(:first-of-type):not(:hover){
            background-color: ${props => props.theme.tableAltRowColor};
        }
    }
`;

export const Td = styled.div`
    min-width: ${props => props.minWidth || '10rem'};
    word-break: break-all;
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
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
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        display: none;
    }
`;

export const Img = styled.img`
    height: 1.5rem;
`;

export const Button = styled(NoStylesButton)`
    margin: 0 0.5rem 0 0;
`;

export const ButtonWithImg = ({ clickHandler, ...rest }) => <Button onClick={clickHandler}><Img {...rest} /></Button>;

ButtonWithImg.propTypes = {
    clickHandler: PropTypes.func.isRequired,
};
