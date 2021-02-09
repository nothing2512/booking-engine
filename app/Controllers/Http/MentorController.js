'use strict';

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin');

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/** @type {typeof import('../../Models/Role')} */
const Role = use('App/Models/Role');

/** @type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile');

/** @type {typeof import('../../Models/UserAttachment')} */
const UserAttachment = use('App/Models/UserAttachment');

/** @type {typeof import('../../Models/UserProfile')} */
const UserProfile = use('App/Models/UserProfile');

/** @type {typeof import('../../Models/Category')} */
const Category = use('App/Models/Category');

/** @type {typeof import('../../Models/AggregatorMentor')} */
const AggregatorMentor = use('App/Models/AggregatorMentor');

/** @type {typeof import('../../Models/MentorSpecialization')} */
const Specialization = use('App/Models/ReaderSpecialization');

/** @type {typeof import('../../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Reader Controller
 *
 * @class MentorController
 */
class MentorController {

    /**
     * get Mentor detail
     *
     * @method mentor_detail
     * @async
     *
     * @param mentor
     * @returns {Promise<*>}
     */
    async mentor_detail(mentor) {
        delete mentor.fcm;
        delete mentor.is_accepted;
        let subquery = Database.from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
            .where(Engine.id("mentor"), mentor.id)
            .select(Engine.id("aggregator"));
        mentor.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery);
        mentor.attachment = await UserAttachment.findBy('user_id', mentor.id);
        mentor.specialization = await Category.query()
            .whereIn("id", Database.from(`${Engine.lower("mentor")}_specializations`).where(Engine.id("mentor"), mentor.id).select("category_id"))
            .fetch();

        return mentor
    }

    /**
     * get most active Mentor
     * by aggregator
     *
     * @method mostActive
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async mostActive({auth, response}) {
        const user = await auth.getUser();
        if (user.role_id != 3) return response.forbidden();

        const subcount = `(SELECT COUNT(*) FROM consultations WHERE ${Engine.id("mentor")} = u.id AND status = 2)`;
        let query = `SELECT u.*, ${subcount} as total_consultation `;
        query += "FROM users u";
        query += ` WHERE u.id IN (SELECT ${Engine.id("mentor")} FROM ${Engine.lower("aggregator")}_${Engine.lower("mentor")}s WHERE ${Engine.id("aggregator")} = ?)`;
        query += "ORDER BY total_consultation DESC";
        const result = [];
        const mentors = await Database.raw(query, [user.id]);

        for (let mentor of mentors.rows) result.push(await this.mentor_detail(mentor));

        return response.success(result)
    }

    /**
     * show Mentor by username
     *
     * @method showByUsername
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async showByUsername({params, response}) {
        let user = await User.findBy('username', params.username);

        if (user == null || user.role_id != 2) return response.notFound(Engine.title("mentor"));

        user.role = await Role.find(user.role_id);
        user.profile = await UserProfile.findBy('user_id', user.id);
        if (user.role_id == 2) user = await this.mentor_detail(user);

        return response.success(user)
    }

    /**
     * edit mentor specialization
     *
     * @method editSpecialization
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async editSpecialization({auth, params, request, response}) {
        let user = await auth.getUser();
        let isAccessible = user instanceof Admin;

        if (user instanceof User) {
            if (user.role_id == 3 && params.id != user.id) isAccessible = (await AggregatorMentor.query()
                .where(Engine.id("aggregator"), user.id)
                .where(Engine.id("mentor"), params.id)
                .getCount()) > 0;
            else isAccessible = params.id == user.id
        }

        if (!isAccessible) return response.forbidden();

        const categoryIds = request.input('category_id', []);
        await Specialization.query()
            .where(Engine.id("mentor"), params.id)
            .delete();

        const payloads = [];
        for (let categoryId of categoryIds) {
            if (await Category.find(id) == null) return response.notFound("Category");
            let payload = {};
            payloads[Engine.id("mentor")] = params.id;
            payloads.category_id = categoryId;
            payloads.push(payload)
        }

        return response.success(await Specialization.createMany(payloads))
    }
}

module.exports = MentorController;
