'use strict';

/**@type {typeof import('../../Models/Consultation')} */
const Consultation = use('App/Models/Consultation');

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/**@type {typeof import('../../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**@type {typeof import('../../Models/UserBalance')} */
const UserBalance = use('App/Models/UserBalance');

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/**
 * Statistic Controller
 *
 * @class StatisticController
 */
class StatisticController {

    /**
     * get statistics
     *
     * @method index
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({auth, response}) {
        const user = await auth.getUser();
        if (user instanceof User && user.role_id != 3) return response.forbidden();

        const statistics = {};

        if (user instanceof User) {
            let mentor_ids = Database.from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
                .where(Engine.id("aggregator"), user.id)
                .select(Engine.id("mentor"));

            statistics[Engine.lower("mentor")] = {
                active: await User.query().where('role_id', 2).whereIn('id', mentor_ids).where('status', 'active').getCount(),
                inactive: await User.query().where('role_id', 2).whereIn('id', mentor_ids).where('status', 'inactive').getCount(),
                banned: await User.query().where('role_id', 2).whereIn('id', mentor_ids).where('status', 'banned').getCount(),
                total: await User.query().where('role_id', 2).whereIn('id', mentor_ids).getCount()
            };

            statistics.consultation = {
                need_paid: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('status', 0).getCount(),
                paid: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('status', 1).getCount(),
                done: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('status', 2).getCount(),
                expired: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('status', 3).getCount(),
                rejected: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('approval_status', 1).getCount(),
                approved: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).where('approval_status', 2).getCount(),
                total: await Consultation.query().whereIn(Engine.id("mentor"), mentor_ids).getCount()
            };

            const userBalance = await UserBalance.findBy('user_id', user.id);
            statistics.balance = userBalance.balance
        } else {
            statistics[Engine.lower("mentor")] = {
                active: await User.query().where('role_id', 2).where('status', 'active').getCount(),
                inactive: await User.query().where('role_id', 2).where('status', 'inactive').getCount(),
                banned: await User.query().where('role_id', 2).where('status', 'banned').getCount(),
                total: await User.query().where('role_id', 2).getCount()
            };
            statistics[Engine.lower("aggregator")] = {
                active: await User.query().where('role_id', 3).where('status', 'active').getCount(),
                inactive: await User.query().where('role_id', 3).where('status', 'inactive').getCount(),
                banned: await User.query().where('role_id', 3).where('status', 'banned').getCount(),
                total: await User.query().where('role_id', 3).getCount()
            };
            statistics.consultation = {
                need_paid: await Consultation.query().where('status', 0).getCount(),
                paid: await Consultation.query().where('status', 1).getCount(),
                done: await Consultation.query().where('status', 2).getCount(),
                expired: await Consultation.query().where('status', 3).getCount(),
                rejected: await Consultation.query().where('approval_status', 1).getCount(),
                approved: await Consultation.query().where('approval_status', 2).getCount(),
                total: await Consultation.query().getCount()
            }
        }

        statistics.user = {
            active: await User.query().where('role_id', 1).where('status', 'active').getCount(),
            inactive: await User.query().where('role_id', 1).where('status', 'inactive').getCount(),
            banned: await User.query().where('role_id', 1).where('status', 'banned').getCount(),
            total: await User.query().where('role_id', 1).getCount()
        };

        return response.success(statistics)
    }
}

module.exports = StatisticController;
