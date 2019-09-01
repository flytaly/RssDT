import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useMutation } from 'react-apollo-hooks';
import { NoStylesButton } from '../styled/buttons';
import { defaultTemplate, composeEmailSubject } from './compose-email-subject';
import periods from '../../types/digest-periods';
import updateMeQuery from './update-me-query';
import { UPDATE_MY_INFO_MUTATION } from '../../queries';

const Button = styled(NoStylesButton)`
    text-decoration: underline dashed;
    font-size: inherit;
    margin-right: 1rem;
`;

const InputWithExample = styled.div`
    display: flex;
    align-items: center;
    input {
        font-size: inherit;
        margin-right: 1rem;
    }
    .example {
        background-color: lightgoldenrodyellow;
    }
`;

const CustomSubject = ({ me, dispatch, isSaving }) => {
    const [subject, setSubject] = useState(me.customSubject || defaultTemplate);
    const example = {
        feedTitle: 'Feed Title',
        period: periods.DAILY,
        template: subject || defaultTemplate,
    };
    const [updateMyInfo] = useMutation(UPDATE_MY_INFO_MUTATION, { update: updateMeQuery });

    const updateSubject = useCallback(async (customSubject) => {
        dispatch({ type: 'customSubject', payload: { isSaving: true } });
        try {
            await updateMyInfo({
                variables: { data: { customSubject } },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateMyInfo: { __typename: 'User', ...me, customSubject },
                },
            });
            dispatch({ type: 'customSubject', payload: { isSaving: false } });
        } catch (e) {
            console.error(e);
            dispatch({ type: 'customSubject', payload: { isSaving: false, error: 'Error occurred during saving' } });
        }
    }, [dispatch, me, updateMyInfo]);
    return (
        <>
            <InputWithExample>
                <input
                    type="text"
                    maxLength="50"
                    size="30"
                    placeholder={defaultTemplate}
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); }}
                    onBlur={() => {
                        if (me.customSubject !== subject) {
                            updateSubject(subject ? subject.trim() : null);
                        }
                    }}
                    disabled={isSaving}
                />
                <div>
                    <span>Example: </span>
                    <span className="example">{composeEmailSubject(example.feedTitle, example.period, example.template)}</span>
                </div>
            </InputWithExample>
            <div>
                <span>template words: </span>
                <i>{'{{ title }} '}</i>
                <span>- title of the feed; </span>
                <i>{'{{ digest }} '}</i>
                <span>- digest type (Daily, Hourly, etc).</span>
            </div>
            <Button
                onClick={() => {
                    if (me.customSubject !== subject) {
                        updateSubject(subject ? subject.trim() : null);
                    }
                }}
                disabled={isSaving || (me.customSubject === subject)}
            >
                {isSaving ? 'Saving' : 'Save'}
            </Button>
            <Button onClick={() => { setSubject(defaultTemplate); }}>Reset</Button>
        </>
    );
};

CustomSubject.propTypes = {
    me: PropTypes.shape({
        customSubject: PropTypes.string,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
};


export default CustomSubject;
