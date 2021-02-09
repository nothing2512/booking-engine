'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

/** @type {import('axios')} */
const Axios = require('axios');

/** @type {import('App/Models/LoginToken')} */
const LoginToken = use('App/Models/LoginToken');

/** @type {import('App/Models/User')} */
const User = use('App/Models/User');

/**
 * Fcm Helper
 * using for sending fcm
 *
 * @class Fcm
 */
class Fcm {

    /**
     * constructor
     */
    constructor() {
        const server_key = Env.get('FCM_KEY', '');
        this.uri = Env.get('FCM_URL', '');
        this.headers = {
            'Content-Type': 'Application/Json',
            'Authorization': 'key=' + server_key
        }
    }

    /**
     * Send Fcm
     *
     * @static
     * @async
     * @method send
     *
     * @param user
     * @param data
     * @param type
     * @returns {Promise<boolean>}
     */
    static async send(user, data, type) {
        return await (new Fcm()).send(user, data, type)
    }

    /**
     * Send Fcm
     *
     * @async
     * @method send
     *
     * @param user
     * @param data
     * @param type
     * @returns {Promise<boolean>}
     */
    async send(user, data, type) {
        const fcm = [];
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
            if (loginToken.fcm != "") fcm.push(loginToken.fcm)
        }

        if (fcm.length != 0) {
            const payloads = {registration_ids: fcm, data: data, type: type};
            try {
                await Axios({
                    method: "post",
                    url: this.uri,
                    headers: this.headers,
                    data: JSON.stringify(payloads)
                });
                return true
            } catch (e) {
                console.log(e);
                return false
            }
        }

        return true
    }
}

module.exports = Fcm;
