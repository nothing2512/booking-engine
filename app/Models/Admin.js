'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/**
 * Admin Model
 *
 * @class Admin
 * @extends Model
 */
class Admin extends Model {

    /**
     * Set Hidden Fields
     *
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
        this.addHook('beforeSave', async (instance) => {
            if (instance.dirty.password) {
                instance.password = await Hash.make(instance.password)
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
        return this.hasMany('App/Models/AdminToken')
    }

    /**
     * News relationship
     *
     * @method news
     *
     * @return {Object}
     */
    news() {
        return this.hasMany('App/Models/News', 'id', 'author_admin_id')
    }

    /**
     * Notifications relationship
     *
     * @method notifications
     *
     * @return {Object}
     */
    notifications() {
        return this.hasMany('App/Models/Notification', 'id', 'admin_id')
    }

}

module.exports = Admin
