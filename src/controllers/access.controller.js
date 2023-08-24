const { CREATED } = require('../core/success/success.response');
const AccessService = require('../services/access.service');

class AccessController {
    signUp = async (req, res, next) => {
        return new CREATED({
            message: 'User created',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    };
}

module.exports = new AccessController();
