/*
    Uncomment a function and run this script with command:
    dotenv -e .env.dev -- node ./src/tests/scripts/create-users.js
*/

const db = require('../../bind-prisma');

const emailPrefix = 'test-user@test';

const createUsers = async (n = 50) => {
    const emails = [];
    for (let i = 0; i < n; i += 1) {
        const email = `${emailPrefix}${i}.test`;
        emails.push(email);
    }
    await Promise.all(emails.map(email => db.mutation.createUser({
        data: {
            email,
            permissions: { set: ['USER'] },
        },
    })));
    console.log(`Create ${n} users`);
};

const deleteCreatedUsers = async () => {
    const { count } = await db.mutation.deleteManyUsers({
        where: {
            email_starts_with: emailPrefix,
        },
    });
    console.log(`Delete ${count} users with email starting with ${emailPrefix}`);
};

// createUsers();
// deleteCreatedUsers();

module.exports = {
    createUsers, deleteCreatedUsers,
};
