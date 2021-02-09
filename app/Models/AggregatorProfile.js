'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * Aggregator Profile Model
 *
 * @class AggregatorProfile
 * @extends Model
 */
class AggregatorProfile extends Model {

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

module.exports = AggregatorProfile
