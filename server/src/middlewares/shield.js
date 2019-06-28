const moment = require('moment-timezone');
const { shield, inputRule } = require('graphql-shield');

const addFeedValidation = inputRule(yup => yup.object({
    email: yup
        .string()
        .email('Not valid argument: email')
        .required('Not valid argument: email'),
    feedUrl: yup
        .string()
        .url('Not valid argument: feedUrl')
        .required('Not valid argument: feedUrl'),
    timeZone: yup
        .string()
        .test('TimeZone', 'Not valid argument: timeZone', (value) => {
            if (!value || moment.tz.zone(value)) return true;
            return false;
        }),
}));

module.exports = shield({
    Mutation: {
        addFeed: addFeedValidation,
    },
});
