'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/**
 * Province Model
 *
 * @class Province
 * @extends Model
 */
class Province extends Model {

    /**
     * cities relationship
     *
     * @method cities
     *
     * @returns {HasMany}
     */
    cities() {
        return this.hasMany('App/Models/City', 'id', 'province_id')
    }
}

module.exports = Province;
