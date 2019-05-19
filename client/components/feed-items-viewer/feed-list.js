import React from 'react';
import styled from 'styled-components';
import get from 'lodash.get';
import Link from 'next/link';
import { withRouter } from 'next/router';
import { useQuery } from 'react-apollo-hooks';
import PropTypes from 'prop-types';
import { MY_FEEDS_QUERY } from '../../queries';

const StyledFeedList = styled.ul`
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 0;
    li {
        padding: 2px 1rem 2px 1.5rem;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    li:hover {
        background-color: ${props => props.theme.feedListHoverBgColor};
    }

    li.active:not(:hover) {
        background-color: ${props => props.theme.feedListActiveBgColor};
    }
    a {
        color: ${props => props.theme.feedListFontColor};
        text-decoration: none;
    }
`;

function FeedList({ linkClickHandler, router }) {
    const { id: activeId } = router.query;
    const { data, loading, error } = useQuery(MY_FEEDS_QUERY);
    const feeds = get(data, 'myFeeds', []);
    if (loading) return <div>Loading...</div>;
    if (error) console.error(error);

    return (
        <StyledFeedList>
            {feeds.map((feedInfo) => {
                const { id, feed: { title, url } } = feedInfo;
                return (
                    <li key={id} className={activeId === id ? 'active' : null}>
                        <Link href={`/feeds/view?id=${id}`}>
                            <a href={`/feeds/view?id=${id}`} onClick={linkClickHandler}>
                                {title || url}
                            </a>
                        </Link>
                    </li>);
            })}
        </StyledFeedList>
    );
}

FeedList.propTypes = {
    router: PropTypes.shape({ query: PropTypes.shape({}) }),
    linkClickHandler: PropTypes.func,
};
FeedList.defaultProps = {
    router: { query: {} },
    linkClickHandler: null,
};

export default withRouter(FeedList);
