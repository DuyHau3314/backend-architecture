const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError } = require('../core/error/error.response');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
            // step1: check if email exists
            const holderShop = await shopModel.findOne({ email }).lean();

            if (holderShop) {
                throw new BadRequestError('Email already exists');
            }

            // step2: create new shop
            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP],
            });

            if (newShop) {
                // created privateKey, publicKey
                // const { privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem',
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem',
                //     }
                // })

                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log({ privateKey, publicKey });

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore) {
                    throw new BadRequestError('Error when create key token');
                }

                const tokens = await createTokenPair(
                    {userId: newShop._id, email},
                    publicKey,
                    privateKey,
                );

                console.log('created tokens', tokens);

                return {
                    code: '201',
                    metadata: {
                        shop: getInfoData({
                            fields: ['_id', 'name', 'email', 'roles'],
                            object: newShop,
                        }),
                        tokens,
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }
    };
}

module.exports = AccessService;
