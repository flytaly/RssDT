/* eslint-disable no-shadow */
const moment = require('moment-timezone');
const { shield, inputRule, chain } = require('graphql-shield');
const yup = require('yup');
const share = require('../mail-sender/share');
const { createRateLimitRuleFromArguments } = require('./rate-limits');

const shareNames = new Set(share.map(({ id }) => id));

const valids = {
    timeZone: yup.string()
        .test('TimeZone', 'Not valid argument: timeZone', (value) => {
            if (!value || moment.tz.zone(value)) return true;
            return false;
        }),
    dailyDigestHour: yup.number().integer().max(23).min(0),
    locale: yup.string().max(50),
    email: yup
        .string()
        .email('Not valid argument: email')
        .required('Not valid argument: email'),
    customSubject: yup
        .string()
        .nullable()
        .max(50, 'Not valid argument: customSubject. Too long.'),
};

const addFeedValidation = inputRule(yup => yup.object({
    email: valids.email,
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
        customSubject: valids.customSubject,
    })
        .required(),
}));

const setPasswordValidation = inputRule(yup => yup.object({
    token: yup.string().required(),
    password: yup.string().min(8).required(),
}));

const emailValidation = inputRule(yup => yup.object({ email: valids.email }));

module.exports = shield({
    Mutation: {
        addFeed: chain(addFeedValidation, createRateLimitRuleFromArguments(
            ({ email, feedUrl }) => `${email}:${feedUrl}`,
            'addFeed',
        )),
        requestPasswordChange: chain(emailValidation, createRateLimitRuleFromArguments(
            ({ email }) => email,
            'passwordChange',
        )),
        requestUnsubscribe: createRateLimitRuleFromArguments(({ id }) => id, 'requestUnsubscribe'),
        resendActivationLink: createRateLimitRuleFromArguments(({ id }) => id, 'sendActivation'),
        setPassword: setPasswordValidation,
        updateMyInfo: updateMyInfoValidation,
    },
}, {
    debug: true,
});
