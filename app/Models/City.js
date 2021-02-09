'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * City Model
 *
 * @class City
 * @extends Model
 */
class City extends Model {

    /**
     * province relationship
     *
     * @method province
     *
     * @returns {HasOne}
     */
    province() {
        return this.hasOne('App/Models/Province', 'province_id', 'id')
    }

    /**
     * districts relationship
     *
     * @method districts
     *
     * @returns {HasMany}
     */
    districts() {
        return this.hasMany('App/Models/District', 'id', 'city_id')
    }
}

module.exports = City
