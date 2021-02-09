'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/**
 * User Referral Model
 *
 * @class UserReferral
 * @extends Model
 */
class UserReferral extends Model {

    /**
     * create referral code from user
     *
     * @static
     * @async
     * @method createFromUser
     *
     * @param user
     * @return {Promise<Model>}
     */
    static async createFromUser(user) {
        const name = user.username
            .replace(" ", "")
            .toUpperCase()
            .replace(/[^a-z]/gi, '')
            .substr(0, 6);
        const id = `${user.id}`;
        return UserReferral.create({
            user_id: user.id,
            referral_code: `${name}${id}`
        });
    }
}

module.exports = UserReferral;
