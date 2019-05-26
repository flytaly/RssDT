/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ListElement = styled.article`
    display: flex;
    flex-direction: column;
    background-color: white;
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 7px;
    p {
        margin: 1rem 0 0 0;
    }
    a {
        text-decoration: none;
        color: ${props => props.theme.feedViewLinkColor};
    }
    pre {
        overflow-x: scroll;
    }
`;

const ElementBody = styled.div`
    margin: 1rem 0 1rem 0;
    video,
    img {
        max-width: 90%;
    }
`;

const Time = styled.div`
    font-size: 1.1rem;
`;

const ElementTitle = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    h3 {
        margin: 0;
        font-size: 1.5rem;
    }
    img{
        max-width: 10rem;
        max-height: 6rem;
    }
`;

const Enclosures = styled.ul`
    list-style: none;
    li {

    }
`;

/**
 * Enclosures url could be too long.
 * This function reduces them to filename and saves them as 'title' property.
*/
const addTitlesToEnclosures = enclosures => enclosures.reduce((acc, enc) => {
    if (!URL) return enc;
    const parsedUrl = new URL(enc.url).pathname;
    const filename = parsedUrl.split('/').pop();
    acc.push({ ...enc, title: filename || enc.url });
    return acc;
}, []);

const imagesTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp'];

const getImageFromEnclosures = (enclosures = []) => {
    const enc = enclosures.find(({ type }) => imagesTypes.includes(type));
    if (enc) return enc.url;
    return null;
};


const FeedItemsListElement = ({ item, locale, timeZone }) => {
    const { link, title, pubDate, description } = item;
    const imageUrl = item.imageUrl || getImageFromEnclosures(item.enclosures || []);
    const enclosures = addTitlesToEnclosures(item.enclosures || []);
    const date = new Date(pubDate);
    const dateArgs = (locale && timeZone) ? [locale, { timeZone }] : [];
    return (
        <ListElement>
            <ElementTitle>
                <div>
                    <h3><a href={link} rel="noopener noreferrer" target="_blank">{title}</a></h3>
                    <Time>{date.toLocaleString(...dateArgs)}</Time>
                </div>
                {imageUrl && (
                    <a href={link} rel="noopener noreferrer" target="_blank">
                        <img src={imageUrl} alt="Open the item" title={title} />
                    </a>) }
            </ElementTitle>
            {description ? <ElementBody dangerouslySetInnerHTML={{ __html: description }} /> : null}
            {enclosures && enclosures.length
                ? (
                    <React.Fragment>
                        <b>Attachments:</b>
                        <Enclosures>
                            {enclosures.map(enc => (
                                <li key={enc.url}>
                                    <a href={enc.url}>{enc.title}</a>
                                    <span>{` (${enc.type})`}</span>
                                </li>))}
                        </Enclosures>
                    </React.Fragment>)
                : null
            }
        </ListElement>);
};

FeedItemsListElement.propTypes = {
    item: PropTypes.shape({}).isRequired,
    locale: PropTypes.string,
    timeZone: PropTypes.string,
};
FeedItemsListElement.defaultProps = {
    locale: '',
    timeZone: '',
};

export default FeedItemsListElement;
