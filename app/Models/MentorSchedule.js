'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Counselor Schedule Model
 *
 * @class MentorSchedule
 * @extends Model
 */
class MentorSchedule extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("mentor")}_schedules`
    }
}

module.exports = MentorSchedule;
