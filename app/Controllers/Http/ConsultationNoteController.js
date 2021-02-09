'use strict';

const
    /**@type {typeof import('../../Models/ConsultationNote')} */
    Note = use('App/Models/ConsultationNote'),

    /**@type {typeof import('../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../Models/CostDistribution')} */
    Cost = use('App/Models/CostDistribution'),

    /**@type {typeof import('../../Models/UserBalance')} */
    Balance = use('App/Models/UserBalance'),

    /**@type {typeof import('../../Models/AppProfile')} */
    AppProfile = use('App/Models/AppProfile'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../Models/Notification')} */
    Notification = use('App/Models/Notification'),

    /** @type {typeof import('../../Helpers/Fcm')} */
    Fcm = use('App/Helpers/Fcm'),

    /** @type {typeof import('../../Helpers/Engine')} */
    Engine = use('App/Helpers/Engine'),

    /**@type {typeof import('../../Models/AggregatorMentor')} */
    AggregatorMentor = use('App/Models/AggregatorMentor'),

    /**@type {typeof import('../../Models/UserProfile')} */
    UserProfile = use('App/Models/UserProfile'),

    /**@type {typeof import('../../Models/UserAttachment')} */
    UserAttachment = use('App/Models/UserAttachment'),

    /**@type {typeof import('../../Models/AggregatorProfile')} */
    AggregatorProfile = use('App/Models/AggregatorProfile'),

    /**@type {typeof import(@adonisjs/lucid/src/Database')} */
    Database = use('Database');

/**
 * Consultation Note Controller
 *
 * @class ConsultationNoteController
 */
class ConsultationNoteController {

    /**
     * get consultation note detail
     *
     * @method detail
     * @async
     *
     * @param note
     * @param consultation
     * @returns {Promise<*>}
     */
    async detail(note, consultation) {

        const mentor = await User.find(consultation[Engine.id("mentor")]);

        delete mentor.fcm;
        mentor.attachment = await UserAttachment.findBy('user_id', mentor.id);

        let subquery = Database.from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
            .where(Engine.id("mentor"), mentor.id)
            .select(Engine.id("aggregator"));
        mentor[`${Engine.lower("aggregator")}Profile`] = await AggregatorProfile.findBy('user_id', subquery);

        const user = await User.find(consultation.user_id);
        user.profile = await UserProfile.find(user.id);

        note[Engine.lower("mentor")] = mentor;
        note.user = user;

        return note
    }

    /**
     * get consultation note list
     *
     * @method index
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({auth, request, response}) {
        const user = await auth.getUser();

        let user_id = request.input("user_id");
        let mentor_id = request.input(Engine.id("mentor"));
        let page = request.input('page', 1);

        let consultations = Consultation.query();

        if (user instanceof User) {
            if (user.role_id === 2) consultations = consultations.where(Engine.id("mentor"), user.id);
            if (user.role_id === 1) consultations = consultations.where('user_id', user.id)
        } else {
            if (!isNaN(user_id)) consultations = consultations.where('user_id', user_id);
            if (!isNaN(mentor_id)) consultations = consultations.where(Engine.id("mentor"), mentor_id)
        }

        const ids = [];

        for (let item of (await consultations.fetch()).toJSON()) ids.push(item.id);

        const result = [];
        const notes = Object.assign({
            status: true,
            message: ""
        }, await Note.query().whereIn('consultation_id', ids).paginate(page));

        for (let note of notes.rows) {
            let consultation = await Consultation.find(note.consultation_id);
            result.push(await this.detail(note, consultation))
        }

        notes.rows = result;

        return response.json(notes)
    }

    /**
     * create consultation note by reader
     *
     * @method store
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({auth, request, response}) {
        const params = request.all();
        const mentor = await auth.getUser();
        let isMentor = false;

        if (mentor instanceof User && mentor.role_id == 2) isMentor = true;

        if (!isMentor) return response.forbidden();

        const consultation = await Consultation.find(params.consultation_id);
        if (consultation == null) return response.notFound("Consultation");

        let note = await consultation.note().fetch();
        if (note == null) note = await Note.create(params);
        else {
            note.merge(params);
            await note.save()
        }

        note = await this.detail(note, consultation);

        const user = await User.find(consultation.user_id);
        const notification = await Notification.create({
            user_id: user.id,
            type: 1,
            parent_id: consultation.id,
            title: "Your Consultation Has Been Done",
            message: "Konsultasi anda telah selesai, periksa notes untuk detailnya..."
        });

        await Fcm.send(user, notification, "notification");

        const aggregator = await AggregatorMentor.findBy(Engine.id("mentor"), consultation[Engine.id("mentor")]);
        const cost = await Cost.findBy(Engine.id("aggregator"), aggregator[Engine.id("aggregator")]);

        const price = consultation.price / 100;
        const clientPrice = (price * (100 - cost[Engine.lower("app")])) / 100;
        const appPrice = price * cost[Engine.lower("app")];
        const aggregatorPrice = clientPrice * cost[Engine.lower("aggregator")];
        const mentorPrice = clientPrice * cost[Engine.lower("mentor")];

        const mentorBalance = await Balance.findBy("user_id", consultation[Engine.id("mentor")]);
        mentorBalance.balance += mentorPrice;
        await mentorBalance.save();

        const aggregatorBalance = await Balance.findBy("user_id", aggregator[Engine.id("aggregator")]);
        aggregatorBalance.balance += aggregatorPrice;
        await aggregatorBalance.save();

        const appProfile = await AppProfile.first();
        appProfile.balance += appPrice;
        await appProfile.save();

        consultation.merge({status: 2});
        await consultation.save();

        return response.success(note)
    }

    /**
     * check if user with provided token has access or not
     *
     * @method is_accessible
     * @async
     *
     * @param note
     * @param user
     * @param consultation
     * @returns {Promise<boolean>}
     */
    async is_accessible(note, user, consultation) {
        if (user instanceof User) {
            let isAccessible = user.id == consultation[Engine.id("mentor")] || user.id == consultation.user_id;
            if (user.role_id == 3) isAccessible = (await AggregatorMentor.query()
                .where(Engine.id("mentor"), consultation[Engine.id("mentor")])
                .where(Engine.id("aggregator"), user.id)
                .getCount()) > 0;

            return isAccessible
        }
        return true
    }

    /**
     * show detail consultation note
     *
     * @method show
     * @async
     *
     * @param auth
     * @param response
     * @param params
     * @returns {Promise<void|*>}
     */
    async show({auth, response, params}) {
        const user = await auth.getUser();
        let note = await Note.find(params.id);
        if (note == null) return response.notFound("Consultation Note");

        const consultation = await Consultation.find(note.consultation_id);
        if (!this.is_accessible(note, user, consultation)) return response.forbidden();
        note = await this.detail(note, consultation);

        return response.success(note)
    }

    /**
     * update consultation note
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*|{data: *, message: string, status: boolean}>}
     */
    async update({auth, params, request, response}) {
        const user = await auth.getUser();
        let note = await Note.find(params.id);
        const obj = request.all();

        if (note == null) return response.notFound("Consultation Note");

        const consultation = await Consultation.find(note.consultation_id);
        if (!this.is_accessible(note, user, consultation)) return response.forbidden();

        note.merge(obj);
        await note.save();

        note = await this.detail(note, consultation);

        return response.success(note)
    }

    /**
     * delete consultation note
     *
     * @method destroy
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({auth, params, response}) {
        const user = await auth.getUser();
        const note = await Note.find(params.id);

        if (note == null) return response.notFound("Consultation Note");

        const consultation = await Consultation.find(note.consultation_id);
        if (!this.is_accessible(note, user, consultation)) return response.forbidden();

        await note.delete();

        return response.success(null)
    }
}

module.exports = ConsultationNoteController;
