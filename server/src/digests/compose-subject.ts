import { DigestSchedule } from '../types/enums.js';
import { digestNames } from './digest-names.js';

export const tokens = {
  title: '{{title}}',
  digestName: '{{digest}}',
};
const defaultTemplate = `${tokens.title}: ${tokens.digestName} digest`;

export const composeEmailSubject = (
  feedTitle: string,
  digestType: DigestSchedule,
  template?: string | null,
) => {
  const digestName = digestNames[digestType];

  if (!template) template = defaultTemplate;

  const replaceTokens = {
    [tokens.title]: feedTitle,
    [tokens.digestName]: digestName,
  };

  const replaceRegEx = new RegExp(Object.values(tokens).join('|'), 'gi');

  const subject = template.replace(replaceRegEx, (match) => replaceTokens[match]);

  return subject;
};
