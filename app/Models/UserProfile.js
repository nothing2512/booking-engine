'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * User Profiles Model
 *
 * @class UserProfile
 * @extends Model
 */
class UserProfile extends Model {

    /**
     * get dates
     *
     * @static
     * @method dates
     *
     * @returns {*[]}
     */
    static get dates() {
        return super.dates.concat(['date_of_birth'])
    }

    /**
     * Cast Dates
     *
     * @method castDates
     * @param field
     * @param value
     * @returns {String|*}
     */
    static castDates(field, value) {
        if (field === 'date_of_birth') {
            return value.format('YYYY-MM-DD')
        }
        return super.formatDates(field, value)
    }

    /**
     * User relationship
     *
     * @method user
     *
     * @returns {BelongsTo}
     */
    user() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

}

module.exports = UserProfile
