import styled from 'styled-components';
import Link from 'next/link';
import PropTypes from 'prop-types';
import withAuth from './decorators/withAuth';

const Menu = styled.ul`
    display: flex;
    font-size: 1.3rem;
    list-style: none;
    margin: 0;
    padding: 0;
    align-self: flex-end;
    li {
        margin-left: 1rem;
    }
`;

const CardHeader = ({ me }) => (
    <Menu data-testid="card-header">
        <li><a href="/">Add new feed</a></li>
        {!me
            ? <li><Link href="/login"><a href="/login">Log in</a></Link></li>
            : (
                <>
                    <li><Link href="/feeds/manage"><a href="/feeds/manage">Manage</a></Link></li>
                    <li><Link href="/logout"><a href="/logout">Log out</a></Link></li>
                </>)}
    </Menu>
);

CardHeader.propTypes = {
    me: PropTypes.shape({}),
};

CardHeader.defaultProps = {
    me: null,
};

export default withAuth(false)(CardHeader);
