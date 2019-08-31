const periodsNames = require('../periods-names');

const tokens = {
    title: '{{title}}',
    digestName: '{{digest}}',
};
const defaultTemplate = `${tokens.title}: ${tokens.digestName} digest`;

const composeEmailSubject = (feedTitle, digestType, template) => {
    const digestName = periodsNames[digestType];

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

module.exports = {
    composeEmailSubject,
    tokens,
    defaultTemplate,
};
