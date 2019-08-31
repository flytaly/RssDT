const cases = require('jest-in-case');
const periodsNames = require('../../periods-names');
const { composeEmailSubject, tokens } = require('../../mail-sender/compose-subject');

cases('Make custom email subject', (opts) => {
    expect(composeEmailSubject(opts.title, opts.digestType, opts.template)).toBe(opts.result);
}, [
    {
        name: 'with default template',
        title: 'Feed Title',
        digestType: 'EVERY3HOURS',
        template: null,
        result: `Feed Title: ${periodsNames.EVERY3HOURS} digest`,
    },
    {
        name: 'with just feed\'s title',
        title: 'Some Feed Title',
        digestType: 'DAILY',
        template: tokens.title,
        result: 'Some Feed Title',
    },
    {
        name: 'with custom subject (without template tokens)',
        title: 'Some Feed Title',
        digestType: 'DAILY',
        template: 'My Digest',
        result: 'My Digest',
    },
    {
        name: 'with custom subject (with template tokens)',
        title: 'Feed\'s Title',
        digestType: 'DAILY',
        template: `My ${tokens.title} ${tokens.digestName} digest`,
        result: `My Feed\'s Title ${periodsNames.DAILY} digest`,
    },
]);
