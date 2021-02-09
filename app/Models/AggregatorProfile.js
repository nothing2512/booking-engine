'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Aggregator Profile Model
 *
 * @class AggregatorProfile
 * @extends Model
 */
class AggregatorProfile extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("aggregator")}_profiles`
    }


    /**
     * User relationship
     *
     * @method user
     *
     * @return {Object}
     */
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

}

module.exports = AggregatorProfile;
