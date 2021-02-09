'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Reader Specialization Model
 *
 * @class MentorSpecialization
 * @extends Model
 */
class MentorSpecialization extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("mentor")}_specializations`
    }

}

module.exports = MentorSpecialization
