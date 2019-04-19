import styled from 'styled-components';
import PropTypes from 'prop-types';
import BigCardHeader from './big-card-header';

const StyledBigCard = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    background: ${props => props.theme.cardBackground};
    color: ${props => props.theme.fontColor};
    width: ${props => props.theme.bigCardWidth}rem;
    max-width: calc(100vw - 2rem);
    min-height: 40rem;
    margin: 2rem auto;
    padding: 1rem 2rem;
    border-radius: 10px;
`;

const BigCard = ({ page, children }) => (
    <StyledBigCard id="bigCard">
        <BigCardHeader page={page} />
        {children}
    </StyledBigCard>
);

BigCard.propTypes = {
    page: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
};

export default BigCard;
