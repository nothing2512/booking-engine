'use strict';

/** @type {import('Encryption')} */
const Encryption = use('Encryption');

/** @type {import('App/Models/LoginToken')} */
const LoginToken = use('App/Models/LoginToken');

/** @type {import('App/Models/User')} */
const User = use('App/Models/User');

/**
 * Tokenizer Helper
 * using for tokenizer helper
 *
 * @class Tokenizer
 */
class Tokenizer {

    /**
     * Create Token
     *
     * @static
     * @async
     * @method create
     *
     * @param user
     * @param token
     * @param authenticator
     * @returns {Promise<Model>}
     */
    static async create(user, token, authenticator) {
        const payload = {
            token: token,
            authenticator: authenticator
        };
        const encrypted = Encryption.encrypt(JSON.stringify(payload));
        return LoginToken.create({
            user_id: user.id,
            token: encrypted,
            type: user instanceof User ? "user" : "admin"
        });
    }

    /**
     * update user fcm
     *
     * @static
     * @async
     * @method updateFcm
     *
     * @param token
     * @param fcm
     * @return {Promise<void>}
     */
    static async updateFcm(token, fcm) {
        const loginToken = await LoginToken.findBy('token', token);
        loginToken.merge({fcm: fcm});
        await loginToken.save()
    }

    /**
     * Get user socket ids by user id
     *
     * @static
     * @async
     * @method getSockets
     *
     * @param user_id
     * @return {Promise<[]>}
     */
    static async getSockets(user_id) {
        const socketIds = [];
        const loginTokens = await LoginToken.query()
            .where('user_id', user_id)
            .fetch();

        for (let x of loginTokens.toJSON()) socketIds.push(x.socket_id);
        return socketIds
    }

    /**
     * update socket id
     *
     * @static
     * @async
     * @method updateSocket
     *
     * @param token
     * @param socket_id
     * @return {Promise<void>}
     */
    static async updateSocket(token, socket_id) {
        const loginToken = await LoginToken.findBy('token', token);
        loginToken.merge({socket_id: socket_id});
        await loginToken.save()
    }

    /**
     * Retrieve user by username
     *
     * @static
     * @async
     * @method retrieveFromUsername
     *
     * @param token
     * @returns {Promise<Model|Null>}
     */
    static async retrieveFromUsername(token) {
        const username = atob(token);
        return User.findBy('username', username);
    }

    /**
     * Retrieve jwt token by request token
     *
     * @static
     * @async
     * @method retrieve
     *
     * @param token
     * @returns {Promise<null|any>}
     */
    static async retrieve(token) {
        const loginToken = await LoginToken.findBy('token', token);
        if (loginToken == null) return null;

        return JSON.parse(Encryption.decrypt(loginToken.token))
    }

    /**
     * Removing stored token
     * using for logout
     *
     * @static
     * @async
     * @method remove
     *
     * @param token
     * @returns {Promise<void>}
     */
    static async remove(token) {
        const loginToken = await LoginToken.findBy('token', token);
        console.log(token);
        console.log(loginToken);
        await loginToken.delete()
    }
}

module.exports = Tokenizer;
