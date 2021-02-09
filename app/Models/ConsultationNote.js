'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * Consultation Note Model
 *
 * @class ConsultationNote
 * @extends Model
 */
class ConsultationNote extends Model {

    /**
     * @static
     * @method get table
     *
     * @returns {string}
     */
    static get table() {
        return "consultation_notes"
    }

    /**
     * Consultation relationship
     *
     * @method consultation
     *
     * @returns {BelongsTo}
     */
    consultation() {
        return this.belongsTo('App/Models/Consultation', 'consultation_id', 'id')
    }
}

module.exports = ConsultationNote
