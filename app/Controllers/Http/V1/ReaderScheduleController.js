'use strict'


const
    /**@type {typeof import('../../../Models/MentorSchedule')} */
    Schedule = use('App/Models/ReaderSchedule'),

    /**@type {typeof import('../../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../../Models/AggregatorMentor')} */
    AggregatorReader = use('App/Models/AggregatorReader'),

    /** @type {import('@adonisjs/lucid/src/Database')} */
    Database = use('Database')

/**
 * Reader Schedule Controller
 *
 * @class ReaderScheduleController
 */
class ReaderScheduleController {

    /**
     * get reader available dates
     *
     * @method dateAvailable
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async dateAvailable({params, response}) {
        const readers = await User.find(params.reader_id)
        if (readers == null) return response.notFound("Reader")

        if (parseInt(readers.role_id) !== 2) return response.notFound("User is not readers")

        const now = new Date()
        let month = now.getMonth() + 1
        let dates = now.getDate()
        let hour = now.getHours() + 2
        hour = `${hour <= 9 ? "0" : ""}${hour}:00:00`
        let dateNow = `${now.getFullYear()}-${month <= 9 ? "0" : ""}${month}-${dates <= 9 ? "0" : ""}${dates}`

        const schedules = []
        const storedSchedules = await Schedule.query()
            .where('reader_id', readers.id)
            .fetch()

        for (let schedule of storedSchedules.toJSON()) schedules[schedule.day] = schedule

        const available = []
        const consultation_dates = await Consultation.query()
            .where('reader_id', readers.id)
            .where('date', '>=', dateNow)
            .where('status', '<>', 3)
            .where('approval_status', '<>', 1)
            .groupBy('date')
            .select(Database.raw("date, COUNT(date) as total, EXTRACT(isodow from date) as day"))
            .fetch()

        for (let date of consultation_dates.toJSON()) {
            if (date.date == dateNow) {
                if (hour < schedules[date.day].end_time) {

                    let total = await Consultation.query()
                        .where('status', '<>', 3)
                        .where('approval_status', '<>', 1)
                        .where('reader_id', readers.id)
                        .where('time', '>', hour)
                        .getCount()

                    if (total > 0) available.push({date: date.date, available: false})
                    else available.push({date: date.date, available: false})
                } else available.push({date: date.date, available: false})
            } else {
                let start_time = parseInt(schedules[date.day].start_time.split(":")[0])
                let end_time = parseInt(schedules[date.day].end_time.split(":")[0])

                if (end_time - start_time <= date.total) available.push({date: date.date, available: false})
            }
        }

        return response.success(available)
    }

    /**
     * get reader time availables by given date
     *
     * @method timeAvailable
     * @async
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async timeAvailable({params, request, response}) {
        const date = request.input('date')
        const day = new Date(date).getDay() + 1
        const available = []

        const now = new Date()
        let month = now.getMonth() + 1
        let dates = now.getDate()
        let hour = now.getHours() + 2
        let dateNow = `${now.getFullYear()}-${month <= 9 ? "0" : ""}${month}-${dates <= 9 ? "0" : ""}${dates}`

        const reader = await User.find(params.reader_id)
        if (reader == null) return response.notFound(reader)

        const schedule = await Schedule.query()
            .where('reader_id', params.reader_id)
            .where('day', day)
            .first()

        if (schedule == null) return response.notFound("Reader Schedule")

        const consultations = (await Consultation.query()
            .where('reader_id', params.reader_id)
            .where('date', date)
            .where('approval_status', '<>', 1)
            .where('status', '<>', 3)
            .fetch()).toJSON()

        for (let i = 0; i <= 23; i++) {
            let time = i < 10 ? `0${i}:00:00` : `${i}:00:00`
            if (time < schedule.start_time || time >= schedule.end_time) available.push({time: time, is_available: false})
            else {
                if (date == dateNow) {
                    if (i < hour) available.push({time: time, is_available: false})
                    else available.push({time: time, is_available: !consultations.some(x => x.time == time)})
                } else available.push({time: time, is_available: !consultations.some(x => x.time == time)})
            }
        }

        return response.success(available)
    }
}

module.exports = ReaderScheduleController
