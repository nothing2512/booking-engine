'use strict'

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin')

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../Models/Role')} */
const Role = use('App/Models/Role')

/** @type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile')

/** @type {typeof import('../../Models/UserAttachment')} */
const UserAttachment = use('App/Models/UserAttachment')

/** @type {typeof import('../../Models/UserProfile')} */
const UserProfile = use('App/Models/UserProfile')

/** @type {typeof import('../../Models/Category')} */
const Category = use('App/Models/TarotCategory')

/** @type {typeof import('../../Models/AggregatorMentor')} */
const AggregatorReader = use('App/Models/AggregatorReader')

/** @type {typeof import('../../Models/MentorSpecialization')} */
const Specialization = use('App/Models/ReaderSpecialization')

/**
 * Reader Controller
 *
 * @class ReaderController
 */
class ReaderController {

    /**
     * get Reader detail
     *
     * @method reader_detail
     * @async
     *
     * @param reader
     * @returns {Promise<*>}
     */
    async reader_detail(reader) {
        delete reader.fcm
        delete reader.is_accepted
        let subquery = Database.from('aggregator_Readers')
            .where('Reader_id', reader.id)
            .select('aggregator_id')
        reader.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)
        reader.attachment = await UserAttachment.findBy('user_id', reader.id)
        reader.specialization = await Category.query()
            .whereIn("id", Database.from("reader_specializations").where("reader_id", reader.id).select("category_id"))
            .fetch()

        return reader
    }

    /**
     * get most active Reader
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
        const user = await auth.getUser()
        if (user.role_id != 3) return response.forbidden()

        const subcount = "(SELECT COUNT(*) FROM consultations WHERE Reader_id = u.id AND status = 2)"
        let query = `SELECT u.*, ${subcount} as total_consultation `
        query += "FROM users u"
        query += " WHERE u.id IN (SELECT Reader_id FROM aggregator_Readers WHERE aggregator_id = ?)"
        query += "ORDER BY total_consultation DESC"
        const result = []
        const Readers = await Database.raw(query, [user.id])

        for (let Reader of Readers.rows) result.push(await this.reader_detail(Reader))

        return response.success(result)
    }

    /**
     * show Reader by username
     *
     * @method showByUsername
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async showByUsername({params, response}) {
        let user = await User.findBy('username', params.username)

        if (user == null || user.role_id != 2) return response.notFound("Reader")

        user.role = await Role.find(user.role_id)
        user.profile = await UserProfile.findBy('user_id', user.id)
        if (user.role_id == 2) user = await this.reader_detail(user)

        return response.success(user)
    }

    /**
     * edit reader specialization
     *
     * @method editReaderSpecialization
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async editReaderSpecialization({auth, params, request, response}) {
        let user = await auth.getUser()
        let isAccessible = user instanceof Admin

        if (user instanceof User) {
            if (user.role_id == 3 && params.id != user.id) isAccessible = (await AggregatorReader.query()
                .where('aggregator_id', user.id)
                .where('reader_id', params.id)
                .getCount()) > 0
            else isAccessible = params.id == user.id
        }

        if (!isAccessible) return response.forbidden()

        const categoryIds = request.input('category_id', [])
        await Specialization.query()
            .where('reader_id', params.id)
            .delete()

        const payloads = []
        for (let categoryId of categoryIds) {
            if (await Category.find(id) == null) return response.notFound("Category")
            payloads.push({
                reader_id: params.id,
                category_id: categoryId
            })
        }

        return response.success(await Specialization.createMany(payloads))
    }
}

module.exports = ReaderController
