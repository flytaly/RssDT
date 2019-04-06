import styled from 'styled-components';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import Link from 'next/link';

const ME_QUERY = gql`
    query ME_QUERY {
        me {
            id
            email
        }
    }
`;

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

const CardHeader = () => {
    const { data, error } = useQuery(ME_QUERY);

    if (error && error.message !== 'GraphQL error: Authentication is required') {
        console.error(error.message);
    }

    return (
        <Menu data-testid="card-header">
            <li><a href="/">Add new feed</a></li>
            {!data.me
                ? <li><Link prefetch href="/login"><a href="/login">Log in</a></Link></li>
                : <>
                    <li><Link href="/subscriptions"><a href="/subscriptions">Manage</a></Link></li>
                    <li><Link href="/logout"><a href="/logout">Log out</a></Link></li>
                </>
            }
        </Menu>
    );
};

export default CardHeader;
export { ME_QUERY };
