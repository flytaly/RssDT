import 'reflect-metadata';
import cases from 'jest-in-case';
import { DigestSchedule } from '../../types/enums';
import { composeEmailSubject, tokens } from '../compose-subject';
import { digestNames } from '../digest-names';

cases(
    'Make custom email subject',
    (opts) => {
        expect(composeEmailSubject(opts.title, opts.digestType, opts.template)).toBe(opts.result);
    },
    [
        {
            name: 'with default template',
            title: 'Feed Title',
            digestType: DigestSchedule.every3hours,
            template: null,
            result: `Feed Title: ${digestNames.every3hours} digest`,
        },
        {
            name: "with just feed's title",
            title: 'Some Feed Title',
            digestType: DigestSchedule.daily,
            template: tokens.title,
            result: 'Some Feed Title',
        },
        {
            name: 'with custom subject (without template tokens)',
            title: 'Some Feed Title',
            digestType: DigestSchedule.daily,
            template: 'My Digest',
            result: 'My Digest',
        },
        {
            name: 'with custom subject (with template tokens)',
            title: "Feed's Title",
            digestType: DigestSchedule.daily,
            template: `My ${tokens.title} ${tokens.digestName} digest`,
            result: `My Feed's Title ${digestNames.daily} digest`,
        },
    ],
);
