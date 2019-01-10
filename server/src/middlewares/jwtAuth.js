const jwt = require('jsonwebtoken');
const logger = require('../logger');

module.exports = db => async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) return next();

        const { userId: id } = jwt.verify(token, process.env.APP_SECRET);
        if (!id) return next();

        const user = await db.query.user(
            { where: { id } },
            '{ id, permissions, email }',
        );
        req.user = user;
    } catch (e) {
        if (e.message !== 'jwt malformed' && e.message !== 'invalid signature') {
            logger.warn(e);
        }
    }
    return next();
};
