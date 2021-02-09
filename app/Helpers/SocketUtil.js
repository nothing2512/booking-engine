'use strict'

/** @type {import('App/Models/LoginToken')} */
const LoginToken = use('App/Models/LoginToken');

/**@type {typeof import(App/Models/User')} */
const User = use('App/Models/User')

/**
 * Socket Util Helper
 * using for socket emitter helper
 *
 * @class SocketUtil
 */
class SocketUtil {

    /**
     * Send Data Using Socket
     *
     * @static
     * @async
     * @method send
     *
     * @param user
     * @param channel
     * @param data
     * @returns {Promise<void>}
     */
    static async send(user, channel, data) {
        let loginToken;
        if (user instanceof User) loginToken = (await LoginToken.query()
            .where("user_id", user.id)
            .where("type", "user")
            .fetch()).toJSON();
        else loginToken = (await LoginToken.query()
            .where("user_id", user.id)
            .where("type", "admin")
            .fetch()).toJSON();

        for (let token of loginToken) {
            if (loginToken.socket_id != "") await global.io.to(loginToken.socket_id).emit(channel, data)
        }
    }
}

module.exports = SocketUtil
