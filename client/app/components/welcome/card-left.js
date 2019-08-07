import React from 'react';
import PropTypes from 'prop-types';
import { StyledLightHalf as CardHalf } from '../styled/card-half';
import GraphQLError from '../graphql-error';
import AlertCircleIcon from '../../static/alert-circle.svg';
import CheckCircleIcon from '../../static/check-circle.svg';
import { Message, MessageLine, SuccessMessage, ErrorMessage, useEmergeTransition } from '../styled/animated-messages';

const CardLeft = ({ messages: { error, success } }) => {
    const items = [{
        text: 'FeedMailu aggregates RSS or Atom feeds into digests and send them to you via email',
        key: 'msg1',
    }, {
        text: 'To start receiving digests just enter an address of desired feed, email and digest period',
        key: 'msg2',
    }];
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

                return (
                    <Message key={key} style={props}>
                        <MessageLine />
                        {item.text}
                    </Message>);
            })}
        </CardHalf>);
};

CardLeft.propTypes = {
    messages: PropTypes.shape({
        error: PropTypes.string,
        success: PropTypes.string,
    }),
};
CardLeft.defaultProps = {
    messages: { error: '', success: '' },
};

export default CardLeft;
