const { CREATED, OK } = require('../core/success/success.response');
const AccessService = require('../services/access.service');

class AccessController {

    handleRefreshToken = async (req, res, next) => {
        return new OK({
            message: 'Get token success!',
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    }

    login = async (req, res, next) => {
        return new CREATED({
            message: 'User logged in',
            metadata: await AccessService.signIn(req.body),
        }).send(res);
    }

    signUp = async (req, res, next) => {
        return new CREATED({
            message: 'User created',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    };

    logout = async (req, res, next) => {
        return new OK({
            message: 'User logged out',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    }
}

module.exports = new AccessController();
