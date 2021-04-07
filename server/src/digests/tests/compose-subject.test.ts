import test from 'ava';
import 'reflect-metadata';
import { DigestSchedule } from '../../types/enums.js';
import { composeEmailSubject, tokens } from '../compose-subject.js';
import { digestNames } from '../digest-names.js';

const subjects = [
  {
    name: 'default template',
    title: 'Feed Title',
    digestType: DigestSchedule.every3hours,
    template: null,
    result: `Feed Title: ${digestNames.every3hours} digest`,
  },
  {
    name: 'just title',
    title: 'Some Feed Title',
    digestType: DigestSchedule.daily,
    template: tokens.title,
    result: 'Some Feed Title',
  },
  {
    name: 'custom subject (without template tokens)',
    title: 'Some Feed Title',
    digestType: DigestSchedule.daily,
    template: 'My Digest',
    result: 'My Digest',
  },
  {
    name: 'custom subject (with template tokens)',
    title: "Feed's Title",
    digestType: DigestSchedule.daily,
    template: `My ${tokens.title} ${tokens.digestName} digest`,
    result: `My Feed's Title ${digestNames.daily} digest`,
  },
];

subjects.forEach(({ name, title, digestType, template, result }) => {
  test(name, (t) => {
    t.is(composeEmailSubject(title, digestType, template), result);
  });
});
