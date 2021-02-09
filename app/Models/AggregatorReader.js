'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * Aggregator Reader Model
 * @class AggregatorReader
 * @extends Model
 */
class AggregatorReader extends Model {

    /**
     * Aggregator Profile relationship
     *
     * @method aggregatorProfile
     *
     * @return {Object}
     */
    aggregatorProfile() {
        return this.hasOne('App/Models/AggregatorProfile', 'aggregator_id', 'user_id')
    }
}

module.exports = AggregatorReader
