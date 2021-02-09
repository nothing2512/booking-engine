'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * District Model
 *
 * @class District
 * @extends Model
 */
class District extends Model {

    /**
     * city relationship
     *
     * @method city
     *
     * @returns {HasOne}
     */
    city() {
        return this.hasOne('App/Models/City', 'city_id', 'id')
    }
}

module.exports = District
