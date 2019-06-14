import React, { useState } from 'react';
import styled from 'styled-components';
import FeedList from './feed-list';
import { NoStylesButton } from '../styled/buttons';
import BarsIcon from '../../static/bars.svg';
import FeedListModalSidebar from './feed-list-modal';

const SmallScreen = styled.div`
    display: none;
    width: 100%;
    min-width: 0;
    padding: 1rem 1rem 1rem 2rem;
    border-bottom-left-radius: 0px;
    color: ${props => props.theme.feedListFontColor};
    background-color: ${props => props.theme.feedViewBgColor};
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        display: block;
    }
`;

const BigScreen = styled.div`
    display: block;
    width: 23%;
    min-width: 15rem;
    padding: 2rem 0 1rem 0;
    border-bottom-left-radius: 9px;
    background-color: ${props => props.theme.feedListBgColor};
    color: ${props => props.theme.feedListFontColor};
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        display: none;
    }
`;

const BarsButton = styled(NoStylesButton)`
    svg {
        height: 1.5rem;
    }
`;

function FeedListSidebar() {
    const [modalInfo, setModalInfo] = useState({ isOpen: false });

    return (
        <React.Fragment>
            <SmallScreen>
                <BarsButton
                    onClick={() => { setModalInfo({ isOpen: true }); }}
                    title="Open list of your feeds"
                >
                    <BarsIcon />
                </BarsButton>
                <FeedListModalSidebar
                    modalInfo={modalInfo}
                    setModalInfo={setModalInfo}
                >
                    <FeedList />
                </FeedListModalSidebar>
            </SmallScreen>
            <BigScreen>
                <FeedList />
            </BigScreen>
        </React.Fragment>
    );
}

export default FeedListSidebar;
