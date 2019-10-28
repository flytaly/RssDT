import React from 'react';
import styled from 'styled-components';
import Sticky from '../sticky';
import contentList from './content-list';

const HelpPageContainer = styled.div`
    position: relative;
    width: 100%;
    font-size: 1.4rem;
    line-height: 1.4;
    h2 {
        font-size: 1.7em;
        text-align: center;
    }
`;

const TableOfContent = styled.nav`
    top: 10px;
    padding: 0.8rem;
    @media all and (min-width: 550px) {
        position: ${({ isFixed }) => (isFixed ? 'fixed' : 'absolute')};
        width: 16rem;
    }
    ul {
        margin: 0;
        padding-left: 1rem;
    }
    a {
        text-decoration: none;
        color: grey;
    }
    a:hover {
        color: black;
    }
`;

const Content = styled.div`
    @media all and (min-width: 550px) {
        margin-left: 16rem;
    }
    h3 {
        font-size: 1.4em;
        margin-top: 4rem;
    }
    img {
        display: block;
        margin: 2rem auto;
        max-width: 100%;
        box-shadow: 0rem 0px 10px 0px rgba(0,0,0,0.5);
        border-radius: 4px;
    }
`;

const Help = () => (
    <HelpPageContainer>
        <h2>Help</h2>
        <Sticky>
            {isFixed => (
                <TableOfContent isFixed={isFixed}>
                    <ul>
                        {contentList.map(({ id, headerText }) => (
                            <li key={id}>
                                <a href={`#${id}`}>{headerText}</a>
                            </li>))}
                    </ul>
                </TableOfContent>)}
        </Sticky>
        <Content>
            {contentList.map(({ id, headerText, content }) => (
                <article key={id}>
                    <h3 id={id}>{headerText}</h3>
                    {content}
                </article>))}
        </Content>
    </HelpPageContainer>);

export default Help;
