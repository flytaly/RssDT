import React, { useCallback, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo-hooks';
import ME_QUERY from '../../queries/me-query';
import { UPDATE_MY_INFO_MUTATION } from '../../queries';
import shareServices from '../../types/share-services';
import CheckBox from '../styled/checkbox';
import Spinner from '../spinner';
import CustomSubject from './custom-subject-option';
import updateMeQuery from './update-me-query';

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
    withContentTableDefault: { isSaving: false, error: null },
    itemBodyDefault: { isSaving: false, error: null },
    attachmentsDefault: { isSaving: false, error: null },
    share: { isSaving: 0, error: null },
    customSubject: { isSaving: false, error: null },
};
function settingsStateReducer(state, action) {
    switch (action.type) {
        case 'digestHour':
            return { ...state, digestHour: action.payload };
        case 'withContentTableDefault':
            return { ...state, withContentTableDefault: action.payload };
        case 'itemBodyDefault':
            return { ...state, itemBodyDefault: action.payload };
        case 'attachmentsDefault':
            return { ...state, attachmentsDefault: action.payload };
        case 'share': {
            const { isSaving } = state.share;
            const inc = action.payload.isSaving;
            return { ...state, share: { ...action.payload, isSaving: inc ? isSaving + 1 : isSaving - 1 } };
        }
        case 'customSubject': {
            return { ...state, customSubject: action.payload };
        }
        default:
            return state;
    }
}

const SettingsComponent = () => {
    const { data: { me } } = useQuery(ME_QUERY);
    const [state, dispatch] = useReducer(settingsStateReducer, initialState);

    const shareFormRef = useRef(null);
    const [updateMyInfo] = useMutation(UPDATE_MY_INFO_MUTATION, { update: updateMeQuery });
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

    const updateWithContentTable = useCallback(async ({ target }) => {
        dispatch({ type: 'withContentTableDefault', payload: { isSaving: true } });
        const withContentTableDefault = target.checked;

        try {
            await updateMyInfo({
                variables: { data: { withContentTableDefault } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, withContentTableDefault },
                },
            });
            dispatch({ type: 'withContentTableDefault', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'withContentTableDefault', payload: { isSaving: false, error: 'Error occurred during saving' } });
        }
    }, [me, updateMyInfo]);

    const updateItemBodyDefault = useCallback(async ({ target }) => {
        dispatch({ type: 'itemBodyDefault', payload: { isSaving: true } });
        const itemBodyDefault = target.checked;

        try {
            await updateMyInfo({
                variables: { data: { itemBodyDefault } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, itemBodyDefault },
                },
            });
            dispatch({ type: 'itemBodyDefault', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'itemBodyDefault', payload: { isSaving: false, error: 'Error occurred during saving' } });
        }
    }, [me, updateMyInfo]);

    const updateAttachmentsDefault = useCallback(async ({ target }) => {
        dispatch({ type: 'attachmentsDefault', payload: { isSaving: true } });
        const attachmentsDefault = target.checked;

        try {
            await updateMyInfo({
                variables: { data: { attachmentsDefault } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, attachmentsDefault },
                },
            });
            dispatch({ type: 'attachmentsDefault', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'itemBodyDefault', payload: { isSaving: false, error: 'Error occurred during saving' } });
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

    const {
        timeZone, locale, email, dailyDigestHour = 18,
        withContentTableDefault, itemBodyDefault, attachmentsDefault,
    } = me;

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
                        <h3>Table of Content</h3>
                        <CheckBox
                            id="withContentTableDefault"
                            title="Include table of content"
                            checked={withContentTableDefault}
                            onChangeHandler={updateWithContentTable}
                            disabled={state.withContentTableDefault.isSaving}
                        />
                        <LoaderContainer>{state.withContentTableDefault.isSaving ? <Spinner /> : null}</LoaderContainer>
                        {state.withContentTableDefault.error
                            ? <ErrorMsg>{state.withContentTableDefault.error}</ErrorMsg>
                            : null}
                    </article>
                    <article>
                        <h3>Feed items content</h3>
                        <CheckBox
                            id="withItemBody"
                            title="Show items content"
                            checked={itemBodyDefault}
                            onChangeHandler={updateItemBodyDefault}
                            disabled={state.itemBodyDefault.isSaving}
                        />
                        <LoaderContainer>{state.itemBodyDefault.isSaving ? <Spinner /> : null}</LoaderContainer>
                        {state.itemBodyDefault.error
                            ? <ErrorMsg>{state.itemBodyDefault.error}</ErrorMsg>
                            : null}
                    </article>
                    <article>
                        <h3>Attachments</h3>
                        <CheckBox
                            id="attachmentsDefault"
                            title="Include links to attachments (enclosures)"
                            checked={attachmentsDefault}
                            onChangeHandler={updateAttachmentsDefault}
                            disabled={state.attachmentsDefault.isSaving}
                        />
                        <LoaderContainer>{state.attachmentsDefault.isSaving ? <Spinner /> : null}</LoaderContainer>
                        {state.attachmentsDefault.error
                            ? <ErrorMsg>{state.attachmentsDefault.error}</ErrorMsg>
                            : null}
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
                        <h3>
                            Edit email subject
                        </h3>
                        <CustomSubject me={me} dispatch={dispatch} isSaving={state.customSubject.isSaving} />
                        {state.customSubject.error ? <ErrorMsg>{state.customSubject.error}</ErrorMsg> : null}
                        <LoaderContainer>{state.customSubject.isSaving ? <Spinner /> : null}</LoaderContainer>
                    </article>
                </Section>
            </InnerContainer>
        </OuterContainer>);
};

export default SettingsComponent;
