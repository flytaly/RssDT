/* eslint-disable no-shadow */
const moment = require('moment-timezone');
const { shield, inputRule } = require('graphql-shield');
const yup = require('yup');
const share = require('../mail-sender/share');

const shareNames = new Set(share.map(({ id }) => id));

const valids = {
    timeZone: yup.string()
        .test('TimeZone', 'Not valid argument: timeZone', (value) => {
            if (!value || moment.tz.zone(value)) return true;
            return false;
        }),
    dailyDigestHour: yup.number().integer().max(23).min(0),
    locale: yup.string().max(50),
};

const addFeedValidation = inputRule(yup => yup.object({
    email: yup
        .string()
        .email('Not valid argument: email')
        .required('Not valid argument: email'),
    feedUrl: yup
        .string()
        .url('Not valid argument: feedUrl')
        .required('Not valid argument: feedUrl'),
    timeZone: valids.timeZone,
    dailyDigestHour: valids.dailyDigestHour,
    locale: valids.locale,
}));

const updateMyInfoValidation = inputRule(yup => yup.object({
    data: yup.object({
        timeZone: valids.timeZone,
        filterShare: yup
            .array()
            .test('filterShare', 'Not valid argument: filterShare', (value) => {
                if (!value) return true;
                return value.every(name => shareNames.has(name));
            }),
        locale: valids.locale,
        dailyDigestHour: valids.dailyDigestHour,
    })
        .required(),
}));

const setPasswordValidation = inputRule(yup => yup.object({
    token: yup.string().required(),
    password: yup.string().min(8).required(),
}));

module.exports = shield({
    Mutation: {
        addFeed: addFeedValidation,
        setPassword: setPasswordValidation,
        updateMyInfo: updateMyInfoValidation,
    },
}, {
    debug: true,
});
