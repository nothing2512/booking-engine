'use strict'

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin')

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../Models/ActivityLog')} */
const Log = use('App/Models/ActivityLog')

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

/** @type {typeof import('../../Models/UserAttachment')} */
const UserAttachment = use('App/Models/UserAttachment')

/** @type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile')

/**
 * Activity Log Controller
 *
 * @class ActivityLogController
 */
class ActivityLogController {

    /**
     * Get Activity Log By User
     *
     * @method show
     * @async
     *
     * @param response
     * @param request
     * @param params
     * @returns {Promise<void|*>}
     */
    async show({response, request, params}) {
        const type = request.input('type', 'user')
        const date = request.input('date', '')
        let user
        if (type == "user") user = await User.find(params.id)
        else user = await Admin.find(params.id)

        if (user == null) return response.notFound("User")

        let logs

        if (date == "" || date == null) logs = await Log.query()
            .where('user_id', user.id)
            .where("type", type)
            .orderBy('created_at', 'desc')
            .fetch()
        else {
            const list_logs = (await Database.raw(
                "SELECT * FROM activity_logs WHERE user_id = ? AND type = ? AND to_char(created_at, 'DD-MM-YYYY') = ? ORDER BY created_at DESC",
                [user.id, type, date]
            )).rows
            const size = list_logs.length
            if (size > 0) {
                const first_seen = list_logs[0]
                const last_seen = list_logs[size - 1]
                logs = {
                    first_seen: first_seen,
                    last_seen: last_seen,
                    detail: list_logs
                }
            } else {
                logs = {
                    first_seen: null,
                    last_seen: null,
                    detail: []
                }
            }
        }

        if (user instanceof User) {

            user.profile = await user.profile().fetch()
            user.role = await user.role().fetch()
            if (user.role_id == 3) user.aggregatorProfile = await user.aggregatorProfile().fetch()
            if (user.role_id == 2) {
                let subquery = Database.from('aggregator_readers')
                    .where('reader_id', user.id)
                    .select('aggregator_id')
                user.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)
            }

            user.attachment = await UserAttachment.findBy('user_id', user.id)
        }

        return response.success({user: user, logs: logs})
    }

    /**
     * Get Recent User Time Logs
     *
     * @method indexRecent
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void>}
     */
    async indexRecent({request, response}) {
        let role_id = request.input('role_id')
        let date = request.input('date')

        if (role_id == "") role_id = null
        if (date == "") date = null

        const logs = await Log.getRecentLogGroup(date, role_id)
        const userLogs = {}
        const keys = []
        const payloads = []

        for (let log of logs.toJSON()) {
            let key = `user_${log.user_id}`

            if (!userLogs.hasOwnProperty(key)) {
                userLogs[key] = []
                keys.push(key)
            }

            userLogs[key].push(await Log.getRecentTimeInADay(log.user_id, log.date))
        }

        if (date != null) {
            for (let key of keys) {
                let user = await User.find(userLogs[key][0].user_id)

                let start_date = new Date("2000-01-01T" + userLogs[key][0].start_time)
                let end_date = new Date("2000-01-01T" + userLogs[key][0].end_time)

                let diff_minutes = Math.round((((end_date - start_date) % 86400000) % 3600000) / 60000)
                let diff_hour = Math.round(diff_minutes / 60)

                payloads.push({
                    user: user,
                    start_time: userLogs[key][0].start_time,
                    end_time: userLogs[key][0].end_time,
                    login_time_in_minute: diff_minutes,
                    login_time_in_hour: diff_hour
                })
            }
        }
        else {

            for (let key of keys) {
                let user = await User.find(userLogs[key][0].user_id)
                let logSize = userLogs[key].length
                let total = 0
                let last_active = ""
                for (let time of userLogs[key]) {
                    total += time.recent_time
                    if (last_active < time.last_active) last_active = time.last_active
                }
                total /= logSize

                payloads.push({
                    user: user,
                    average_minutes_per_day: Math.round(total),
                    average_hour_per_day: Math.round(total / 60),
                    last_active: last_active
                })
            }
        }

        return response.success(payloads)
    }
}

module.exports = ActivityLogController
