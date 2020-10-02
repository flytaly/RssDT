/* eslint-disable import/no-extraneous-dependencies */
const faker = require('faker/locale/en');

// faker.seed(323);

const generateFeed = (activated = true) => ({
    url: faker.internet.url(),
    title: faker.random.words(),
    activated,
});

const generateFeedItems = ({ startDate = (new Date()).toString(), count = 3 } = {}) => {
    const items = [];
    const date = new Date(startDate);
    for (let i = 0; i < count; i += 1) {
        const link = faker.internet.url();
        const description = faker.lorem.sentence();
        items.push({
            title: faker.random.words(),
            description,
            summary: description,
            pubDate: new Date(date),
            link,
            guid: link,
        });
        date.setHours(date.getHours() + 1); // +1 hours per item
    }
    return items;
};

module.exports = {
    generateFeed,
    generateFeedItems,
};
