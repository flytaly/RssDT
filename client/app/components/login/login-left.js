import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { StyledLightHalf as CardHalf } from '../styled/card-half';
import GraphQLError from '../graphql-error';
import AlertCircleIcon from '../../public/static/alert-circle.svg';
import CheckCircleIcon from '../../public/static/check-circle.svg';
import { Message, MessageLine, SuccessMessage, ErrorMessage, useEmergeTransition } from '../styled/animated-messages';
import formTypes from './form-types';

const staticMessages = {
    [formTypes.login]: [{
        key: 'logInMsg1',
        getComponent: props => (
            <Message {...props}>
                <MessageLine />
                <span>Log in to manage your feeds or change settings</span>
            </Message>),
    }, {
        key: 'logInMsg2',
        getComponent: props => (
            <Message {...props}>
                <MessageLine />
                <span>
                    To reset or create new password click
                    {' '}
                    <Link href="/request-reset"><a>here</a></Link>
                </span>
            </Message>),
    }],
    [formTypes.set_password]: [{
        key: 'setPasswordMsg1',
        getComponent: props => (
            <Message {...props}>
                <MessageLine />
                <span>
                    Enter your new password twice
                </span>
            </Message>),
    }],
    [formTypes.request_password]: [{
        key: 'requestPasswordMsg1',
        getComponent: props => (
            <Message {...props}>
                <MessageLine />
                <span>
                    To reset password enter your email
                </span>
            </Message>),
    }, {
        key: 'requestPasswordMsg2',
        getComponent: props => (
            <Message {...props}>
                <MessageLine />
                <span>
                    <Link href="/login"><a>Back to log in</a></Link>
                </span>
            </Message>),
    }],
};

const CardLeft = ({ currentForm, messages: { error, success } }) => {
    const items = [...staticMessages[currentForm]];
    if (error) items.push({ text: error, key: error, type: 'error' });
    if (success) items.push({ text: success, key: success, type: 'success' });
    const transitions = useEmergeTransition(items);

    return (
        <CardHalf>
            {transitions.map(({ item, props, key }) => {
                if (item.type === 'error') {
                    return (
                        <ErrorMessage key={key} style={props} data-testid="err-msg">
                            <AlertCircleIcon />
                            <GraphQLError error={item.text} />
                        </ErrorMessage>
                    );
                }
                if (item.type === 'success') {
                    return (
                        <SuccessMessage key={key} style={props} data-testid="ok-msg">
                            <CheckCircleIcon />
                            <GraphQLError error={item.text} />
                        </SuccessMessage>
                    );
                }
                if (item.getComponent) {
                    return <item.getComponent key={key} style={props} />;
                }
                return null;
            })}
        </CardHalf>
    );
};
CardLeft.propTypes = {
    currentForm: PropTypes.oneOf(Object.keys(formTypes)),
    messages: PropTypes.shape({
        error: PropTypes.string,
        success: PropTypes.string,
    }),
};
CardLeft.defaultProps = {
    currentForm: formTypes.login,
    messages: { error: '', success: '' },
};

export default CardLeft;
