'use strict'

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
    BacatarotProfile = use('App/Models/BacatarotProfile'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../Models/Notification')} */
    Notification = use('App/Models/Notification'),

    /** @type {typeof import('../../Helpers/Fcm')} */
    Fcm = use('App/Helpers/Fcm'),

    /**@type {typeof import('../../Models/AggregatorMentor')} */
    AggregatorReader = use('App/Models/AggregatorReader'),

    /**@type {typeof import('../../Models/UserProfile')} */
    UserProfile = use('App/Models/UserProfile'),

    /**@type {typeof import('../../Models/UserAttachment')} */
    UserAttachment = use('App/Models/UserAttachment'),

    /**@type {typeof import('../../Models/AggregatorProfile')} */
    AggregatorProfile = use('App/Models/AggregatorProfile'),

    /**@type {typeof import(@adonisjs/lucid/src/Database')} */
    Database = use('Database')

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

        const reader = await User.find(consultation.reader_id)

        delete reader.fcm
        reader.attachment = await UserAttachment.findBy('user_id', reader.id)

        let subquery = Database.from('aggregator_readers')
            .where('reader_id', reader.id)
            .select('aggregator_id')
        reader.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)

        const user = await User.find(consultation.user_id)
        user.profile = await UserProfile.find(user.id)

        note.reader = reader
        note.user = user

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
        const user = await auth.getUser()

        let {reader_id, user_id} = request.get();
        let page = request.input('page', 1)

        let consultations = Consultation.query()

        if (user instanceof User) {
            if (user.role_id === 2) consultations = consultations.where('reader_id', user.id)
            if (user.role_id === 1) consultations = consultations.where('user_id', user.id)
        } else {
            if (!isNaN(user_id)) consultations = consultations.where('user_id', user_id)
            if (!isNaN(reader_id)) consultations = consultations.where('reader_id', reader_id)
        }

        const ids = []

        for (let item of (await consultations.fetch()).toJSON()) ids.push(item.id)

        const result = []
        const notes = Object.assign({
            status: true,
            message: ""
        }, await Note.query().whereIn('consultation_id', ids).paginate(page))

        for (let note of notes.rows) {
            let consultation = await Consultation.find(note.consultation_id)
            result.push(await this.detail(note, consultation))
        }

        notes.rows = result

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
        const params = request.all()
        const reader = await auth.getUser()
        let isReaders = false

        if (reader instanceof User && reader.role_id == 2) isReaders = true

        if (!isReaders) return response.forbidden()

        const consultation = await Consultation.find(params.consultation_id)
        if (consultation == null) return response.notFound("Consultation")

        let note = await consultation.note().fetch()
        if (note == null) note = await Note.create(params);
        else {
            note.merge(params)
            await note.save()
        }

        note = await this.detail(note, consultation)

        const user = await User.find(consultation.user_id)
        const notification = await Notification.create({
            user_id: user.id,
            type: 1,
            parent_id: consultation.id,
            title: "Your Consultation Has Been Done",
            message: "Konsultasi anda telah selesai, periksa notes untuk detailnya..."
        })

        await Fcm.send(user, notification, "notification")

        const aggregator = await AggregatorReader.findBy("reader_id", consultation.reader_id)
        const cost = await Cost.findBy('aggregator_id', aggregator.aggregator_id)

        const price = consultation.price / 100
        const clientPrice = (price * (100 - cost.bacatarot)) / 100
        const bacatarotPrice = price * cost.bacatarot
        const aggregatorPrice = clientPrice * cost.aggregator
        const readerPrice = clientPrice * cost.reader

        const readerBalance = await Balance.findBy("user_id", consultation.reader_id)
        readerBalance.balance += readerPrice
        await readerBalance.save()

        const aggregatorBalance = await Balance.findBy("user_id", aggregator.aggregator_id)
        aggregatorBalance.balance += aggregatorPrice
        await aggregatorBalance.save()

        const bacatarotProfile = await BacatarotProfile.first()
        bacatarotProfile.balance += bacatarotPrice
        await bacatarotProfile.save()

        /**
         * add bacatarot, aggregator, and reader balance
         */
        consultation.merge({status: 2})
        await consultation.save()

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
            let isAccessible = user.id == consultation.reader_id || user.id == consultation.user_id
            if (user.role_id == 3) isAccessible = (await AggregatorReader.query()
                .where('reader_id', consultation.reader_id)
                .where('aggregator_id', user.id)
                .getCount()) > 0

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
        const user = await auth.getUser()
        let note = await Note.find(params.id)
        if (note == null) return response.notFound("Consultation Note")

        const consultation = await Consultation.find(note.consultation_id)
        if (!this.is_accessible(note, user, consultation)) return response.forbidden()
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
        const user = await auth.getUser()
        let note = await Note.find(params.id)
        const obj = request.all()

        if (note == null) return response.notFound("Consultation Note")

        const consultation = await Consultation.find(note.consultation_id)
        if (!this.is_accessible(note, user, consultation)) return response.forbidden()

        note.merge(obj);
        await note.save();

        note = await this.detail(note, consultation)

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
        const user = await auth.getUser()
        const note = await Note.find(params.id)

        if (note == null) return response.notFound("Consultation Note")

        const consultation = await Consultation.find(note.consultation_id)
        if (!this.is_accessible(note, user, consultation)) return response.forbidden()

        await note.delete()

        return response.success(null)
    }
}

module.exports = ConsultationNoteController
