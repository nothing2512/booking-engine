'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * User Model
 *
 * @class User
 * @extends Model
 */
class User extends Model {

    /**
     * Set created at column
     *
     * @method createdAtColumn
     * @static
     *
     * @returns {string}
     */
    static get createdAtColumn() {
        return 'registered_at'
    }

    /**
     * Set hidden field
     *
     * @method hidden
     * @static
     *
     * @returns {string[]}
     */
    static get hidden() {
        return ['password']
    }

    /**
     * Method to be called only once to boot
     * the model.
     *
     * NOTE: This is called automatically by the IoC
     * container hooks when you make use of `use()`
     * method.
     *
     * @method boot
     *
     * @return {void}
     *
     * @static
     */
    static boot() {
        super.boot()

        /**
         * A hook to hash the user password before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (userInstance) => {
            if (userInstance.dirty.password) {
                userInstance.password = await Hash.make(userInstance.password)
            }
        })
    }

    /**
     * A relationship on tokens is required for auth to
     * work. Since features like `refreshTokens` or
     * `rememberToken` will be saved inside the
     * tokens table.
     *
     * @method tokens
     *
     * @return {Object}
     */
    tokens() {
        return this.hasMany('App/Models/UserToken')
    }

    /**
     * Referral Relationship
     *
     * @method referral
     *
     * @return {HasOne}
     */
    referral() {
        return this.hasOne("App/Models/UserReferral", "id", "user_id")
    }

    /**
     * Role relationship
     *
     * @method role
     *
     * @returns {HasOne}
     */
    role() {
        return this.hasOne('App/Models/Role', 'role_id', 'id')
    }

    /**
     * Aggregator Profile Relationship
     *
     * @method aggregatorProfile
     *
     * @returns {HasOne}
     */
    aggregatorProfile() {
        return this.hasOne('App/Models/AggregatorProfile', 'id', 'user_id')
    }

    /**
     * Profile Relationship
     *
     * @method profile
     *
     * @returns {HasOne}
     */
    profile() {
        return this.hasOne('App/Models/UserProfile', 'id', 'user_id')
    }

    /**
     * Attachment Relationship
     *
     * @method attachment
     *
     * @returns {HasOne}
     */
    attachment() {
        return this.hasOne('App/Models/UserAttachment', 'id', 'user_id')
    }

    /**
     * Schedules Relationship
     *
     * @method schedules
     *
     * @returns {HasMany}
     */
    schedules() {
        return this.hasMany("App/Models/ReaderSchedule", 'id', 'reader_id')
    }

    /**
     * Specialization Relationship
     *
     * @method specialization
     *
     * @returns {HasMany}
     */
    specialization() {
        return this.hasMany("App/Models/ReaderSpecialization", 'id', 'reader_id')
    }

    /**
     * Notifications Relationship
     *
     * @method notifications
     *
     * @returns {HasMany}
     */
    notifications() {
        return this.hasMany('App/Models/Notification', 'id', 'user_id')
    }

    /**
     * selecting average query
     *
     * @method select_average_query
     * @static
     *
     * @param user
     */
    static select_average_query(user) {
        let reader_aggre_relations
        if (user != null) reader_aggre_relations = `SELECT reader_id FROM aggregator_readers WHERE aggregator_id = ${user.id}`
        else reader_aggre_relations = `SELECT reader_id FROM aggregator_readers`

        const avg_price = "COALESCE((SELECT AVG(price) FROM consultations WHERE reader_id = users.id), 0) as avg_price"
        const avg_paid = "COALESCE((SELECT AVG(price) FROM consultations WHERE user_id = users.id), 0) as avg_paid"
        const avg_income = `COALESCE((SELECT AVG(price) FROM consultations WHERE reader_id IN (${reader_aggre_relations})), 0) as avg_income`

        return `users.*, ${avg_price}, ${avg_paid}, ${avg_income}`
    }

}

module.exports = User
