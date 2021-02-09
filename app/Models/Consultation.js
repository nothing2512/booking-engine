'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Consultation Model
 *
 * @class Consultation
 * @extends Model
 */
class Consultation extends Model {

    /**
     * Voucher Relationship
     *
     * @method voucher
     *
     * @return {HasOne}
     */
    voucher() {
        return this.hasOne("App/Models/ConsultationVoucher", "id", "consultation_id")
    }

    /**
     * Payment relationship
     *
     * @method payment
     *
     * @return {HasOne}
     */
    payment() {
        return this.hasOne('App/Models/Payment', 'id', 'consultation_id')
    }

    /**
     * Note relationship
     *
     * @method note
     *
     * @returns {HasOne}
     */
    note() {
        return this.hasOne('App/Models/ConsultationNote', 'id', 'consultation_id')
    }

    /**
     * chat relationship
     *
     * @method chats
     *
     * @returns {HasMany}
     */
    chats() {
        return this.hasMany('App/Models/ConsultationChat', 'id', 'consultation_id')
    }

    /**
     * User relationship
     *
     * @method user
     *
     * @returns {HasOne}
     */
    user() {
        return this.hasOne('App/Models/User', 'user_id', 'id')
    }

    /**
     * Category relationship
     *
     * @method user
     *
     * @returns {HasOne}
     */
    category() {
        return this.hasOne('App/Models/BookCategory', "category_id", 'id')
    }

    /**
     * Mentor relationship
     *
     * @method reader
     *
     * @returns {HasOne}
     */
    mentor() {
        return this.hasOne('App/Models/User', Engine.id("mentor"), 'id')
    }
}

module.exports = Consultation;
