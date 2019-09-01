import { periodNames } from '../../types/digest-periods';

export const tokens = {
    title: '{{title}}',
    digestName: '{{digest}}',
};
export const defaultTemplate = `${tokens.title}: ${tokens.digestName} digest`;

export const composeEmailSubject = (feedTitle, digestType, template) => {
    const digestName = periodNames[digestType];

    // eslint-disable-next-line no-param-reassign
    if (!template) template = defaultTemplate;

    const replaceTokens = {
        [tokens.title]: feedTitle,
        [tokens.digestName]: digestName,
    };

    const replaceRegEx = new RegExp(Object.values(tokens).join('|'), 'gi');

    const subject = template.replace(replaceRegEx, match => replaceTokens[match]);

    return subject;
};
