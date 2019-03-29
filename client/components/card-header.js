import styled from 'styled-components';

const Menu = styled.div`
    font-size: 1.3rem;
    align-self: flex-end;
`;

const CardHeader = () => (
    <Menu>
        <a href="/login">Login</a>
    </Menu>
);

export default CardHeader;
