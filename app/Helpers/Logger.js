'use strict'


/** @type {typeof import('../Models/ActivityLog')} */
const Log = use('App/Models/ActivityLog')

/** @type {typeof import('../Models/User')} */
const User = use('App/Models/User')

/**
 * Logger Helper
 * using for activity logging helper
 *
 * @class Logger
 */
class Logger {

    /**
     * Create Log
     *
     * @static
     * @async
     * @method log
     *
     * @param user
     * @param route
     * @param payload
     * @param data
     * @returns {Promise<Model>}
     */
    static async log(user, route, payload = {}, data="") {
        if (user == null) return Log.create(
            {
                user_id: 0,
                type: "guest",
                action: route,
                data: data,
                ...payload
            }
        );

        return Log.create({
            user_id: user.id,
            type: user instanceof User ? "user" : "admin",
            action: route,
            data: data,
            ...payload
        });
    }

    /**
     * update log
     *
     * @method update
     * @async
     * @static
     *
     * @param log
     * @param key
     * @param value
     * @returns {Promise<void>}
     */
    static async update(log, key, value) {
        log[key] = value;
        await log.save()
    }
}

module.exports = Logger
