import React, { useCallback, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo-hooks';
import ME_QUERY from '../queries/me-query';
import { UPDATE_MY_INFO_MUTATION } from '../queries';
import shareServices from '../types/share-services';
import CheckBox from './styled/checkbox';
import Spinner from './spinner';

const OuterContainer = styled.main`
    padding: 2rem;
`;
const InnerContainer = styled.div`
    max-width: 70rem;
    margin: 0 auto;
`;
const Section = styled.section`
    margin: 2rem 0;
    article {
        position: relative;
        border-bottom: 1px solid ${props => props.theme.borderColorLight};
        padding: 2rem 0;
    }
    article > form > div,
    article > *:not(:last-child){
        margin-bottom: 1rem;
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
const LoaderContainer = styled.div`
    position: absolute;
    right: 0;
    top: 10px;
`;

const ErrorMsg = styled.div`
    color: ${props => props.theme.errorMsgColor};
`;

const updateMeQuery = (dataProxy, mutationResult) => {
    try {
        const data = dataProxy.readQuery({ query: ME_QUERY });
        data.me = { ...data.me, ...mutationResult.data.updateMyInfo };
        dataProxy.writeQuery({ query: ME_QUERY, data });
    } catch (e) {
        console.error(e);
    }
};

const range = (start = 0, stop = 23) => {
    const result = [];
    for (let i = start; i <= stop; i += 1) {
        result.push(i);
    }
    return result;
};

export const SettingsTitles = [
    { id: 'profile', name: 'Profile' },
    { id: 'digest', name: 'Digest Settings' },
];

const initialState = {
    digestHour: { isSaving: false, error: null },
    share: { isSaving: 0, error: null },
};
function settingsStateReducer(state, action) {
    switch (action.type) {
        case 'digestHour':
            return { ...state, digestHour: action.payload };
        case 'share': {
            const { isSaving } = state.share;
            const inc = action.payload.isSaving;
            return { ...state, share: { ...action.payload, isSaving: inc ? isSaving + 1 : isSaving - 1 } };
        }
        default:
            return state;
    }
}

const SettingsComponent = () => {
    const { data: { me } } = useQuery(ME_QUERY);
    const [state, dispatch] = useReducer(settingsStateReducer, initialState);

    const shareFormRef = useRef(null);
    const updateMyInfo = useMutation(UPDATE_MY_INFO_MUTATION, { update: updateMeQuery });
    const updateDigestHour = useCallback(async ({ target }) => {
        const dailyDigestHour = parseInt(target.value, 10);
        dispatch({ type: 'digestHour', payload: { isSaving: true } });
        try {
            await updateMyInfo({
                variables: { data: { dailyDigestHour } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, dailyDigestHour },
                },
            });
            dispatch({ type: 'digestHour', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'digestHour', payload: { isSaving: false, error: 'Error occurred during saving' } });
        }
    }, [me, updateMyInfo]);
    const updateShareLinks = useCallback(async (formRef) => {
        if (!formRef.current) return;
        dispatch({ type: 'share', payload: { isSaving: true } });
        try {
            const inputs = [...formRef.current.elements];
            const filterShare = inputs.filter(input => input.checked).map(input => input.name);
            const shareEnable = !!filterShare.length;
            await updateMyInfo({
                variables: { data: { shareEnable, filterShare } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, shareEnable, filterShare },
                },
            });
            dispatch({ type: 'share', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'share', payload: { isSaving: false, error: 'Error occurred during saving' } });
        }
    }, [me, updateMyInfo]);
    const { timeZone, locale, email, dailyDigestHour = 18 } = me;

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
                        <label htmlFor="digest-hour-select"><h3>Daily digest hour</h3></label>
                        <div>Select the hour you want to receive daily digests:</div>
                        <select
                            id="digest-hour-select"
                            value={dailyDigestHour}
                            onChange={updateDigestHour}
                            disabled={state.digestHour.isSaving}
                        >
                            {range(0, 23).map(hour => <option key={hour} value={hour}>{`${hour}:00`}</option>)}
                        </select>
                        <LoaderContainer>{state.digestHour.isSaving ? <Spinner /> : null}</LoaderContainer>
                        {state.digestHour.error ? <ErrorMsg>{state.digestHour.error}</ErrorMsg> : null}
                    </article>
                    <article>
                        <h3>
                            Links to online services
                        </h3>
                        <form ref={shareFormRef} onChange={() => updateShareLinks(shareFormRef)}>
                            {shareServices.map((s) => {
                                const { shareEnable, filterShare } = me;
                                const checkAll = shareEnable && !filterShare.length;
                                const checkThis = checkAll || filterShare.includes(s.id);
                                return <CheckBox key={s.id} name={s.id} {...s} checked={checkThis} />;
                            })}
                        </form>
                        {state.share.error ? <ErrorMsg>{state.share.error}</ErrorMsg> : null}
                        <LoaderContainer>{state.share.isSaving ? <Spinner /> : null}</LoaderContainer>
                    </article>
                    <article>
                        <h3>Links to online services</h3>
                    </article>
                </Section>
            </InnerContainer>
        </OuterContainer>);
};

export default SettingsComponent;
