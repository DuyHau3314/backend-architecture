const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, ForbiddenError } = require('../core/error/error.response');
const { findByEmail } = require('./shop.service');
const keytokenModel = require('../models/keytoken.model');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {

    /*
        check this token used?
    */
    static handleRefreshToken = async ({keyStore, user, refreshToken}) => {
        const {userId, email} = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {

            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Invalid request token. Pls relogin');
        }

        if(keyStore.refreshToken !== refreshToken) {
            throw new ForbiddenError('Shop not registered');
        }

        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);

        if (foundToken) {
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey);
            if (userId && email) {}

            await KeyTokenService.deleteKeyById(userId);

            throw new ForbiddenError('Something went wrong || Pls relogin');
        }

        const foundShop = await findByEmail({ email });

        if (!foundShop) {
            throw new ForbiddenError('Invalid request');
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

        if (!holderToken) {
            throw new ForbiddenError('Invalid request token');
        }

        const tokens = await createTokenPair({
            userId: foundShop._id,
            email,
        }, holderToken.publicKey, holderToken.privateKey);

        await keytokenModel.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            }
        });

        return {
            user: { userId, email },
            tokens
        }

    }

    static logout = async (keyStore) => {

        if (!keyStore._id) {
            throw new BadRequestError('Invalid request');
        }

        const result = await KeyTokenService.removeKeyById(keyStore._id);

        return result;
    }

    static signIn = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email });

        if (!foundShop) {
            throw new BadRequestError('Email not found');
        }

        const isPasswordValid = await bcrypt.compare(password, foundShop.password);

        if (!isPasswordValid) {
            throw new BadRequestError('Password is invalid');
        }

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair({
            userId: foundShop._id,
            email,
        }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            userId: foundShop._id,
            publicKey,
            privateKey
        });

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email', 'roles'],
                object: foundShop,
            }),
            tokens,
        }
    }

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

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore) {
                    throw new BadRequestError('Error when create key token');
                }

                const tokens = await createTokenPair(
                    {userId: newShop._id.toString(), email},
                    publicKey,
                    privateKey,
                );

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
