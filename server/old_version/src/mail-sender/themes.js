const fs = require('fs');
const Handlebars = require('handlebars');

const themeFolders = {
    default: `${__dirname}/templates/default`,
};

const compileHbsPart = (path, part) => Handlebars.compile(fs.readFileSync(`${path}/${part}.part.mjml`, 'utf-8'));

module.exports = {
    default: {
        header: compileHbsPart(themeFolders.default, 'header'),
        contentTable: compileHbsPart(themeFolders.default, 'content_table'),
        item: compileHbsPart(themeFolders.default, 'item'),
        footer: compileHbsPart(themeFolders.default, 'footer'),
    },
};
