'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Aggregator Mentor Model
 * @class AggregatorMentor
 * @extends Model
 */
class AggregatorMentor extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`
    }

    /**
     * Aggregator Profile relationship
     *
     * @method aggregatorProfile
     *
     * @return {Object}
     */
    aggregatorProfile() {
        return this.hasOne('App/Models/AggregatorProfile', Engine.id("aggregator"), 'user_id')
    }
}

module.exports = AggregatorMentor;
