const isLocked = jest.fn(async () => 0);
const lock = jest.fn(async () => 1);
const unlock = jest.fn(async () => 0);

module.exports = {
    isLocked,
    lock,
    unlock,
};
