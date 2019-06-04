import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo-hooks';
import ME_QUERY from '../queries/me-query';

const OuterContainer = styled.main`
    padding: 2rem;
`;
const InnerContainer = styled.div`
    max-width: 70rem;
    margin: 0 auto;
`;
const Section = styled.section`
    margin: 1rem 0;
    article {
        border-bottom: 1px solid ${props => props.theme.borderColorLight};
        padding: 2rem 0;
    }
    header {
        border-bottom: 1px solid ${props => props.theme.borderColorLight};
    }
    h2 {
        font-size: 1.8rem;
    }
    h3 {
        font-size: 1.4rem;
        font-weight: bold;
        margin: 0 0 1rem 0;
    }
`;


export const SettingTitles = [
    { id: 'profile', name: 'Profile' },
    { id: 'digest', name: 'Digest Settings' },
];


const ManageFeeds = () => {
    const { data: { me } } = useQuery(ME_QUERY);
    const { timeZone, locale, email } = me;

    return (
        <OuterContainer>
            <InnerContainer>
                <Section>
                    <header><h2 id="profile">Profile information</h2></header>
                    <article>
                        <h3>Email</h3>
                        <div>{email}</div>
                    </article>
                    <article>
                        <h3>Timezone</h3>
                        <div>{timeZone}</div>
                    </article>
                    <article>
                        <h3>Date locale</h3>
                        <div>{locale}</div>
                    </article>
                </Section>
                <Section>
                    <header><h2 id="digest">Email Digest Settings</h2></header>
                    <article>
                        <h3>Daily digest hour</h3>
                        <div>Description...</div>
                        <div>18:00</div>
                    </article>
                </Section>
            </InnerContainer>
        </OuterContainer>);
};

export default ManageFeeds;
