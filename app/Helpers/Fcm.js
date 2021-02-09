'use strict';

/** @type {import('axios')} */
const Axios = require('axios');

/** @type {import('App/Models/LoginToken')} */
const LoginToken = use('App/Models/LoginToken');

/** @type {import('./Engine')} */
const Engine = use('App/Helpers/Engine');

/** @type {import('./SocketUtil')} */
const SocketUtil = use('App/Helpers/SocketUtil');

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
        const server_key = Engine.get("fcm.key");
        this.uri = Engine.get("fcm.url");
        this.headers = {
            'Content-Type': 'Application/Json',
            'Authorization': 'key=' + server_key
        }
    }

    /**
     * Test send fcm
     *
     * @static
     * @async
     * @method test
     *
     * @param fcm
     * @param data
     * @param type
     * @return {Promise<*>}
     */
    static async test(fcm, data, type) {
        const payloads = {registration_ids: [fcm], data: data, type: type};
        try {
            return await Axios({
                method: "post",
                url: Engine.get("fcm.url"),
                headers: {
                    'Content-Type': 'Application/Json',
                    'Authorization': 'key=' + Engine.get("fcm.key")
                },
                data: JSON.stringify(payloads)
            });
        } catch (e) {
            console.log(e);
            return e.message
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
        await SocketUtil.send(user, type, data);
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
