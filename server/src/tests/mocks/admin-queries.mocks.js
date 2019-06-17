/* eslint-disable import/no-extraneous-dependencies */
const faker = require('faker/locale/en');

faker.seed(57);

const user = {
    email: faker.internet.email(),
    permissions: { set: ['USER'] },
};

const admin = {
    email: faker.internet.email(),
    permissions: { set: ['USER', 'ADMIN'] },
};

module.exports = {
    user,
    admin,
};
