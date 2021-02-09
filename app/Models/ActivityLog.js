'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/**
 * Activity Log Model
 *
 * @class ActivityLog
 * @extends Model
 */
class ActivityLog extends Model {

    /**
     * Get recent log group
     *
     * @static
     * @async
     * @method getRecentLogGroup
     *
     * @param date
     * @param role_id
     * @returns {Promise<Response>}
     */
    static async getRecentLogGroup(date = null, role_id = null) {
        let log = ActivityLog.query()
            .select(Database.raw("user_id,created_at::DATE::VARCHAR as date"))
            .where("type", "user")
            .groupBy("date")
            .groupBy("user_id")
            .orderBy("date", "DESC");

        if (date != null) log = log.where(Database.raw('created_at::DATE = ?', [date]));
        if (role_id != null) log = log.whereIn('user_id', Database.from("users").where("role_id", role_id).select("user_id"));

        return await log.fetch()
    }

    /**
     * Get recent time in a day
     *
     * @static
     * @async
     * @method getRecentTimeInADay
     *
     * @param user_id
     * @param date
     * @returns {Promise<*>}
     */
    static async getRecentTimeInADay(user_id, date) {
        const log_db = await Database
            .raw(`SELECT
                    (SELECT created_at::TIME
                    FROM activity_logs
                    WHERE user_id = ${user_id} AND created_at::DATE = '${date}'
                    ORDER BY created_at DESC
                    LIMIT 1) as end_time,

                    (SELECT created_at
                    FROM activity_logs
                    WHERE user_id = ${user_id} AND created_at::DATE = '${date}'
                    ORDER BY created_at DESC
                    LIMIT 1) as last_active,

                    (SELECT created_at::TIME
                    FROM activity_logs
                    WHERE user_id = ${user_id} AND created_at::DATE = '${date}'
                    ORDER BY created_at ASC
                    LIMIT 1) as start_time,

                    (EXTRACT(EPOCH FROM

                    (SELECT created_at::TIME
                    FROM activity_logs
                    WHERE user_id = ${user_id} AND created_at::DATE = '${date}'
                    ORDER BY created_at DESC
                    LIMIT 1)

                    -

                    (SELECT created_at::TIME
                    FROM activity_logs
                    WHERE user_id = ${user_id} AND created_at::DATE = '${date}'
                    ORDER BY created_at ASC
                    LIMIT 1)

                    )/60)::INTEGER as recent_time`
            );

        log_db.rows[0].user_id = user_id;

        return log_db.rows[0]
    }
}

module.exports = ActivityLog;
