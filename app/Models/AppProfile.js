'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * App Profile Model
 *
 * @class AppProfile
 * @extends Model
 */
class AppProfile extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("app")}_profiles`
    }
}

module.exports = AppProfile;
