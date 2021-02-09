'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Counselor Join Request Model
 *
 * @class MentorJoinRequest
 * @extends Model
 */
class MentorJoinRequest extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("mentor")}_join_requests`
    }
}

module.exports = MentorJoinRequest;
