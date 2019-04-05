import styled from 'styled-components';

const Menu = styled.ul`
    display: flex;
    column-gap: 1rem;
    font-size: 1.3rem;
    list-style: none;
    margin: 0;
    padding: 0;
    align-self: flex-end;
`;

const CardHeader = () => (
    <Menu data-testid="card-header">
        <li><a href="/">Subscribe</a></li>
        <li><a href="/login">Log in</a></li>
    </Menu>
);

export default CardHeader;
