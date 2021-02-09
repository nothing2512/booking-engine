'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * Payment Model
 *
 * @class Payment
 * @extends Model
 */
class Payment extends Model {

    /**
     * Consultation relationship
     *
     * @method consultation
     *
     * @returns {BelongsTo}
     */
    consultation() {
        return this.belongsTo('App/Model/Consultation', 'id', 'consultation_id')
    }
}

module.exports = Payment
