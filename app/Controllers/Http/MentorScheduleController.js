'use strict';

const
    /**@type {typeof import('../../Models/MentorSchedule')} */
    Schedule = use('App/Models/MentorSchedule'),

    /**@type {typeof import('../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../Helpers/Engine')} */
    Engine = use('App/Helpers/Engine'),

    /**@type {typeof import('../../Models/AggregatorMentor')} */
    AggregatorMentor = use('App/Models/AggregatorMentor');

/**
 * Reader Schedule Controller
 *
 * @class MentorScheduleController
 */
class MentorScheduleController {

    /**
     * create mentor schedule
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const day = request.input("day")
        const mentor_id = request.get(Engine.id("mentor"));

        const mentor = await User.find(mentor_id);
        if (mentor == null) return response.notFound("Reader");

        const schedules = await Schedule.query()
            .where(Engine.id("mentor"), '=', mentor_id)
            .where('day', '=', day)
            .fetch();

        if (schedules.toJSON().length > 0) {

            /**
             * If Exists, Update It
             */
            const params = {...schedules[0], ...request.all()};
            await Schedule.query()
                .where(Engine.id("mentor"), '=', mentor_id)
                .where('day', '=', day)
                .update(params);

            return response.success(params)
        } else {

            /**
             * If Doesn't Exists, Create It
             */
            const schedule = await Schedule.create(request.all());
            return response.success(schedule)
        }
    }

    /**
     * get mentor time available by given date
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
        const date = request.input("date");
        const day = new Date(date).getDay() + 1;
        const available = [];

        const mentor = await User.find(params[Engine.id("mentor")]);
        if (mentor == null) return response.notFound(Engine.title("mentor"));

        const schedule = (await Schedule.query()
            .where(Engine.id("mentor"), params[Engine.id("mentor")])
            .where('day', day)
            .fetch()).toJSON();

        const consultations = (await Consultation.query()
            .where(Engine.id("mentor"), params[Engine.id("mentor")])
            .where('date', date)
            .where('approval_status', '<>', 1)
            .fetch()).toJSON();

        const start_time = parseInt(schedule[0].start_time.split(":")[0]);
        const end_time = parseInt(schedule[0].end_time.split(":")[0]);

        for (let i = start_time; i <= end_time - 1; i++) {
            let time = i < 10 ? `0${i}:00:00` : `${i}:00:00`;
            available.push({
                time: time,
                is_available: !consultations.some(x => x.time == time)
            })
        }

        return response.success(available)
    }

    /**
     * get mentor available dates
     *
     * @method dateAvailable
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async dateAvailable({params, response}) {
        const now = new Date();
        const available = [];
        const mentor = await User.find(params[Engine.id("mentor")]);
        if (mentor == null) return response.notFound(Engine.title("mentor"));

        if (parseInt(mentor.role_id) !== 2) return response.notFound(`User is not ${Engine.lower("mentor")}`);

        for (let i = 0; i <= 30; i++) {
            let month = now.getMonth() + 1;
            let dates = now.getDate();
            let date = `${now.getFullYear()}-${month <= 9 ? "0" : ""}${month}-${dates <= 9 ? "0" : ""}${dates}`;
            let day = now.getDay() + 1;
            now.setDate(now.getDate() + 1);

            let schedule = (await Schedule.query()
                .where(Engine.id("mentor"), mentor.id)
                .where('day', day)
                .fetch()).toJSON()[0];

            let start_time = parseInt(schedule.start_time.split(":")[0]);
            let end_time = parseInt(schedule.end_time.split(":")[0]);
            let total_time = end_time - start_time;

            let total_booked = await Consultation.query()
                .where(Engine.id("mentor"), mentor.id)
                .where('date', date)
                .where('approval_status', '<>', 1)
                .getCount();

            available.push({
                date: date,
                total_schedule: total_time,
                available: total_time - total_booked,
                booked: total_booked
            })
        }

        return response.success(available)
    }

    /**
     * get available mentor by given date
     *
     * @method available
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async available({request, response}) {
        const date = request.input("date")
        const day = new Date(date).getDay() + 1;
        const available = [];

        const mentors = (await User.query()
            .where('role_id', 2)
            .fetch()).toJSON();

        for (let x of mentors) {
            try {
                let schedule = (await Schedule.query()
                    .where("day", day)
                    .where(Engine.id("mentor"), x.id)
                    .fetch()).toJSON()[0];

                let total = await Consultation.query()
                    .where('date', date)
                    .where(Engine.id("mentor"), x.id)
                    .where('approval_status', '<>', 2)
                    .getCount();

                let aggregator = await AggregatorMentor.findBy(Engine.id("mentor"), x.id);
                if (aggregator != null) {

                    let start_time = parseInt(schedule.start_time.split(":")[0]);
                    let end_time = parseInt(schedule.end_time.split(":")[0]);
                    let time = end_time - start_time;

                    x.total_schedule = time;
                    x.available = time - total;
                    x.aggregator_profile = await aggregator.aggregatorProfile().fetch();

                    available.push(x)
                }
            } catch (e) {
            }
        }

        return response.success(available)
    }

    /**
     * show mentor schedule
     *
     * @method show
     * @async
     *
     * @param response
     * @param params
     * @returns {Promise<void|*>}
     */
    async show({response, params}) {
        const schedule = await Schedule.query().where(Engine.id("mentor"), params.id).fetch();
        return response.success(schedule)
    }

    /**
     * update mentor schedule
     *
     * @method update
     * @async
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*|{data: *, message: string, status: boolean}>}
     */
    async update({params, request, response}) {
        const schedule = await Schedule.find(params.id);
        if (schedule == null) return response.notFound("Schedule");
        schedule.merge(request.all());
        await schedule.save();
        return response.success(schedule)
    }

    /**
     * delete reader schedule
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        const schedule = await Schedule.find(params.id);
        if (schedule != null) await schedule.delete();
        return response.success(null)
    }
}

module.exports = MentorScheduleController;
