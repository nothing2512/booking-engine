'use strict'

const
    /**@type {typeof import('../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../Models/AggregatorProfile')} */
    AggregatorProfile = use('App/Models/AggregatorProfile'),

    /**@type {typeof import('../../Models/AggregatorReader')} */
    AggregatorReader = use('App/Models/AggregatorReader'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../Models/UserVoucher')} */
    UserVoucher = use('App/Models/UserVoucher'),

    /**@type {typeof import('../../Models/UserBalance')} */
    UserBalance = use('App/Models/UserBalance'),

    /**@type {typeof import('../../Models/TarotCategory')} */
    Category = use('App/Models/TarotCategory'),

    /**@type {typeof import('../../Helpers/Payment')} */
    Payment = use('App/Helpers/Payment'),

    /**@type {typeof import('../../Helpers/Fcm')} */
    Fcm = use('App/Helpers/Fcm'),

    /**@type {typeof import('../../Models/Notification')} */
    Notification = use('App/Models/Notification'),

    /**@type {import('../../Helpers/Zoom')} */
    ZoomApi = use('App/Helpers/Zoom'),

    /** @type {import('@adonisjs/lucid/src/Database')} */
    Database = use('Database')

/**
 * Consultation Controller
 *
 * @class ConsultationController
 */
class ConsultationController {

    /**
     * get detail consultation
     *
     * @method detail
     * @async
     *
     * @param consultation
     * @returns {Promise<*>}
     */
    async detail(consultation) {
        if (consultation.status === 0) {
            const payment = await consultation.payment().fetch()
            const midtrans = await Payment.check(payment.midtrans_transaction_id)

            if (midtrans.transaction_status == "settlement") {
                consultation.merge({status: 1})
                await consultation.save()
                await Notification.query()
                    .where('user_id', consultation.user_id)
                    .where('parent_id', consultation.id)
                    .delete()
                const user_notification = await Notification.create({
                    user_id: consultation.user_id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation has been paid",
                    message: "Anda telah membayar readers, periksa jadwal konsultasi sekarang juga"
                })
                const user = await User.find(consultation.user_id)
                await Fcm.send(user, user_notification, "notification")
            } else if (midtrans.transaction_status === "expire") {
                consultation.merge({status: 3})
                await consultation.save()

                await Notification.query()
                    .where('user_id', consultation.user_id)
                    .where('parent_id', consultation.id)
                    .delete()
                const user_notification = await Notification.create({
                    user_id: consultation.user_id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation has been expired",
                    message: "Jadwal Konsultasi anda telah kadaluarsa"
                })
                const user = await User.find(consultation.user_id)
                await Fcm.send(user, user_notification, "notification")
            }
        }

        consultation.payment = await consultation.payment().fetch()
        consultation.note = await consultation.note().fetch()
        const cuser = await consultation.user().fetch()
        const creader = await consultation.reader().fetch()
        cuser.profile = await cuser.profile().fetch()
        creader.profile = await creader.profile().fetch()
        consultation.user = cuser
        consultation.reader = creader
        consultation.voucher = await consultation.voucher().fetch()
        consultation.chats = await consultation.chats().orderBy('created_at', 'desc').fetch()
        consultation.category = await consultation.category().fetch()
        consultation = consultation.toJSON()

        switch (consultation.payment.method) {
            case 1:
                consultation.payment.name = "BCA"
                break;
            case 2:
                consultation.payment.name = "BNI"
                break;
            case 3:
                consultation.payment.name = "BRI"
                break;
            case 4:
                consultation.payment.name = "Mandiri Bill"
                break;
            case 5:
                consultation.payment.name = "Permata"
                break;
            case 6:
                consultation.payment.name = "Gopay"
                break;
            case 7:
                consultation.payment.name = "BCA KlikPay"
                break;
            case 8:
                consultation.payment.name = "CIMB Clicks"
                break;
            case 9:
                consultation.payment.name = "Danamon Online Banking"
                break;
            case 10:
                consultation.payment.name = "E Pay BRI"
                break;
            case 11:
                consultation.payment.name = "Alfamaret"
                break;
            case 12:
                consultation.payment.name = "Indomaret"
                break;
            case 13:
                consultation.payment.name = "Akulaku"
                break;
            default:
                consultation.payment.name = "BCA"
                break;
        }

        return consultation
    }

    /**
     * check user consultations expired
     *
     * @method check_expire
     * @async
     *
     * @param user
     * @returns {Promise<void>}
     */
    async check_expire(user) {
        if (user.role_id == 1) {
            const date = new Date()
            const now = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
            const query = Consultation.query()
                .where('user_id', user.id)
                .where(Database.raw(`date::date < '${now}'::date`))
                .whereIn('status', [0, 1])

            const consultation = await query.fetch()
            await query.update({status: 3})

            if (user.fcm != null) for (let item of consultation.toJSON()) {
                const notification = await Notification.create({
                    user_id: user.id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation Expired",
                    message: "Jadwal konsultasi anda telah kadaluarsa"
                })
                await Fcm.send(user, notification, "notification")
            }
        }
    }

    /**
     * get consultation list by provided token ordered by date
     *
     * @method indexByDate
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async indexByDate({auth, request, response}) {
        const user = await auth.getUser()
        let {reader_id, date, user_id, status, approval_status} = request.get()
        let page = request.input('page', 1)
        let consultation = Consultation.query()
        let aggregator_id = null

        await this.check_expire(user)

        if (user instanceof User) {
            if (user.role_id == 2) reader_id = user.id
            else if (user.role_id == 1) user_id = user.id
            else if (user.role_id == 3) aggregator_id = user.id
        }

        if (aggregator_id != null) consultation = consultation.whereIn("reader_id",
            Database
                .from("aggregator_readers")
                .where("aggregator_id", aggregator_id)
                .select("reader_id")
        )

        if (!isNaN(reader_id)) consultation = consultation.where('reader_id', reader_id)

        if (!isNaN(user_id)) consultation = consultation.where('user_id', user_id)
        if (date != null) consultation = consultation.where('date', date)

        if (!isNaN(approval_status)) consultation = consultation.where('approval_status', approval_status)
        else consultation = consultation.where('approval_status', 2)

        if (!isNaN(status)) consultation = consultation.where('status', status)
        else consultation = consultation.where('status', '<>', 0)

        const result = Object.assign({
            status: true,
            message: ""
        }, await consultation.orderBy('status', 'asc').orderBy('date', 'asc').orderBy('time', 'asc').paginate(page))

        for (let i = 0; i < result.rows.length; i++) result.rows[i] = await this.detail(result.rows[i])

        return response.json(result)
    }

    /**
     * get consultation list by provided token
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
        let {reader_id, date, user_id} = request.get()
        let consultation = Consultation.query()
        let page = request.input('page', 1)
        let aggregator_id = null

        await this.check_expire(user)

        if (user instanceof User) {
            if (user.role_id == 2) reader_id = user.id
            if (user.role_id == 1) user_id = user.id
            else if (user.role_id == 3) aggregator_id = user.id
        }

        if (aggregator_id != null) consultation = consultation.whereIn("reader_id",
            Database
                .from("aggregator_readers")
                .where("aggregator_id", aggregator_id)
                .select("reader_id")
        )
        if (!isNaN(reader_id)) consultation = consultation.where('reader_id', reader_id)
        if (!isNaN(user_id)) consultation = consultation.where('user_id', user_id)
        if (date != null) consultation = consultation.where('date', date)
        consultation = consultation.where('status', '<>', 3).where('status', '<>', 0).where('approval_status', 2)

        const result = Object.assign({
            status: true,
            message: ""
        }, await consultation.orderBy('status', 'asc').orderBy('date', 'desc').orderBy('time', 'desc').paginate(page))

        for (let i = 0; i < result.rows.length; i++) result.rows[i] = await this.detail(result.rows[i])

        return response.json(result)
    }

    /**
     * booking readers / create consultations by santri
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

        const params = request.only(["reader_id", "user_id", "date", "time", "price", "voucher_code", "category_id"])
        const user = await auth.getUser()
        let voucherPayload = {}

        if (user.status == 'inactive') return response.error("Confirm your email first")

        let userAccess = false

        if (user instanceof User && user.role_id === 1) userAccess = true
        if (!userAccess) return response.success("Just santri can booking reader")

        params.user_id = user.id

        const reader = await User.find(params.reader_id)
        if (reader == null) return response.notFound("Reader")

        const aggregatorReader = await AggregatorReader.findBy("reader_id", params.reader_id)
        if (aggregatorReader == null) return response.error("Reader has been not joined with aggregator")

        const profile = await AggregatorProfile.findBy("user_id", aggregatorReader.aggregator_id)
        if (profile == null) return response.notFound("Aggregator")

        const category = await Category.find(params.category_id)
        if (category == null) return response.notFound("Category")

        params.status = 0
        if (profile.isCommunity === false && isNaN(params.price)) response.error("Please input infaq amount first")
        else params.price = profile.reader_price

        if (params.voucher_code != null && params.voucher_code != "") {
            const now = new Date()
            const voucher = await UserVoucher.query()
                .where("voucher_code", params.voucher_code)
                .where("user_id", params.user_id)
                .first()

            if (voucher == null) return response.notFound("Voucher")
            if (voucher.used) return response.error("Voucher has been used in another consultation")
            if (voucher.valid_until != null) {
                if (now > (new Date(voucher.valid_until))) return response.error("Voucher is expired")
            }

            if (voucher.payment_method != "" && voucher.payment_method != null && voucher.payment_method != request.input('payment_method'))
                return response.error("Payment method not allowed for this voucher")

            voucher.merge({used: true})
            await voucher.save()
            let originalPrice = params.price
            let price = params.price
            let cashback = 0

            switch (voucher.type) {
                case 1:
                    price = params.price - voucher.discounts
                    break;
                case 2:
                    price = params.price * voucher.percentage / 100
                    break;
                case 3:
                    cashback = params.price - voucher.discounts
                    break;
                default:
                    cashback = params.price * voucher.percentage / 100
                    break;
            }

            if (voucher.max_discount != "" && voucher.max_discount != null) {
                if (voucher.max_discount < price) price = voucher.max_discount
                if (voucher.max_discount < cashback) cashback = voucher.max_discount
            }

            if (price > originalPrice) {
                price = 0
                params.status = 1
            }
            params.price = price

            voucherPayload = {
                payment_method: voucher.payment_method,
                type: voucher.type,
                voucher_code: voucher.code,
                title: voucher.title,
                description: voucher.description,
                image: voucher.image,
                value: voucher.value,
                max_discount: voucher.max_discount,
                original_price: originalPrice,
                price: params.price
            }

            if (cashback > 0) {
                const userBalance = await UserBalance.findBy('user_id', params.user_id)
                userBalance.balance += cashback
                await userBalance.save()
            }
        }

        let consultation_available = await Consultation.query()
            .where('reader_id', reader.id)
            .where('date', params.date)
            .where('time', params.time)
            .where('approval_status', '<>', 1)
            .getCount()

        if (consultation_available > 0) return response.error("Reader has been booked by another user in that time")

        let consultation = await Consultation.create(params)
        let payment

        if (voucherPayload != {}) await consultation.voucher().create(voucherPayload)

        if (params.price == 0) payment = Payment.free()
        else payment = await Payment.make(
            request.input('payment_method'),
            consultation.id,
            consultation.price,
            "Booking Reader"
        )

        await consultation.payment().create({
            midtrans_transaction_id: payment.transaction_id,
            method: request.input('payment_method'),
            price: consultation.price,
            va_number: payment.va_code,
            qr_link: payment.qr_link,
            redirect_link: payment.redirect_link,
            bill_key: payment.bill_key,
            bill_code: payment.bill_code
        })

        consultation = await this.detail(consultation)

        const reader_notification = await Notification.create({
            user_id: consultation.reader_id,
            type: 1,
            parent_id: consultation.id,
            title: "You have been booked",
            message: user.name + " telah memesan anda, cek jadwal konsultasi untuk selengkapnya"
        })

        const user_notification = await Notification.create({
            user_id: user.id,
            type: 2,
            parent_id: consultation.id,
            title: "Pay your readers now!",
            message: "Anda telah memesan readers, segera bayar sebelum jatuh tempo"
        })

        if (reader.fcm != null) await Fcm.send(reader, reader_notification, "notification")
        if (user.fcm != null) await Fcm.send(user, user_notification, "notification")

        return response.success(consultation)
    }

    /**
     * get payment methods
     *
     * @method paymentMethods
     * @async
     *
     * @param response
     * @returns {Promise<void|*>}
     */
    async paymentMethods({response}) {
        return response.json(Payment.methods())
    }

    /**
     * get consultation detail
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
        const consultation = await Consultation.find(params.id)
        const user = await auth.getUser()

        if (consultation == null) return response.error("Consultation not found")

        if (user instanceof User) {
            let isAccessible = user.id == consultation.user_id || user.id == consultation.reader_id
            if (user.role_id == 3) {
                const total = await AggregatorReader.query()
                    .where('aggregator_id', user.id)
                    .where('reader_id', consultation.reader_id)
                    .getCount()
                isAccessible = total > 0
            }

            if (!isAccessible) return response.forbidden()
        }

        return response.success(await this.detail(consultation))
    }

    /**
     * reader approve / reject santri consultation main process
     *
     * @method readerAction
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @param action
     * @returns {Promise<void|*>}
     */
    async readerAction({auth, params, response}, action) {
        const reader = await auth.getUser()
        if (reader == null) return response.forbidden()

        if (reader.role_id !== 2) return response.success("Just reader can perform this action")

        let consultation = await Consultation.find(params.id)
        if (consultation == null) return response.notFound("Consultation")

        if (consultation.reader_id != reader.id) return response.forbidden()

        let zoomResponse = null

        const fields = {approval_status: action}
        if (action == 2) {
            zoomResponse = await ZoomApi.createMeeting()
            Object.assign(fields, {zoom_join_url: zoomResponse['join_url']})
        }

        consultation.merge(fields)
        await consultation.save()

        const notification = await Notification.create({
            user_id: consultation.user_id,
            type: 1,
            parent_id: consultation.id,
            title: action === 1 ? "Consultation has been rejected" : "Consultation has been approved",
            message: action === 1 ?
                "Readers yang anda booking tidak menyetujui booking anda, mohon cari readers lain" :
                "Readers yang anda booking telah menyetujui booking anda."
        })

        const user = await User.find(consultation.user_id)
        if (user.fcm != null) await Fcm.send(user, notification, "notification")

        if (zoomResponse !== null) {
            consultation.toJSON()
            Object.assign(consultation, {
                zoom_password: zoomResponse['password'],
                zoom_passcode: zoomResponse['pstn_password']
            })
        }

        consultation = await this.detail(consultation)

        return response.success(consultation)
    }

    /**
     * reader reject santri consultation
     *
     * @method reject
     * @async
     *
     * @param requests
     * @returns {Promise<*>}
     */
    async reject(requests) {
        return this.readerAction(requests, 1)
    }

    /**
     * reader approve santri consultation
     *
     * @method approve
     * @async
     *
     * @param requests
     * @returns {Promise<*>}
     */
    async approve(requests) {
        return this.readerAction(requests, 2)
    }

    /**
     * check replacement reader is valid or not
     *
     * @method isReplacementValid
     *
     * @param user
     * @param consultation
     * @returns {{data: null, message: string, status: boolean}|{status: boolean}}
     */
    isReplacementValid(user, consultation) {
        let message = ""
        if (consultation == null) message = "Consultation not found"
        if (consultation.status == 0) message = "You has been not pay for this consultation"
        if (consultation.approval_status == 2) message = "Your consultation has been approved by readers"
        if (consultation.user_id != user.id) message = "Forbidden access"
        if (message !== "") return {
            status: false,
            message: message,
            data: null
        }
        return {status: true}
    }

    /**
     * find replacement reader by santri
     * if consultation has been rejected by reader
     *
     * @method findReplacement
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async findReplacement({auth, params, response}) {
        let available = []
        let aggregator_ids = []
        let reader_ids = []

        const user = await auth.getUser()
        const consultation = await Consultation.find(params.id)

        const valid = this.isReplacementValid(user, consultation)
        if (!valid.status) return response.json(valid)

        let profile = AggregatorProfile.query()
        if (consultation.isCommunity === false) profile = profile.where('price', consultation.price)
        profile = (await profile.fetch()).toJSON()

        for (let x of profile) aggregator_ids.push(x.user_id)

        const aggregator_readers = (await AggregatorReader.query().whereIn('aggregator_id', aggregator_ids).fetch()).toJSON()
        for (let x of aggregator_readers) reader_ids.push(x.reader_id)

        const readers = (await User.query()
            .whereIn('id', reader_ids)
            .where("status", "active")
            .where('id', '<>', consultation.reader_id)
            .with('profile')
            .with('aggregatorProfile')
            .with('role')
            .fetch()).toJSON()

        for (let x of readers) {
            let total = await Consultation.query()
                .where('date', consultation.date)
                .where('time', consultation.time)
                .where('reader_id', x.id)
                .getCount()

            let subquery = Database.from('aggregator_readers')
                .where('reader_id', x.id)
                .select('aggregator_id')
            x.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)

            if (total === 0) available.push(x)
        }

        return response.success(available)
    }

    /**
     * replace reader by santri
     *
     * @method replaceReader
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async replaceReader({auth, request, response}) {
        const user = await auth.getUser()
        let consultation = await Consultation.find(request.input('consultation_id'))

        const valid = this.isReplacementValid(user, consultation)
        if (!valid.status) return response.json(valid)

        const reader = await User.find(request.input('reader_id'))
        if (reader == null) return response.notFound("Reader")

        consultation.merge({
            reader_id: reader.id,
            approval_status: 0
        })
        await consultation.save()

        const notification = await Notification.create({
            user_id: consultation.reader_id,
            type: 1,
            parent_id: consultation.id,
            title: "You have been booked",
            message: user.name + " telah memesan anda, cek jadwal konsultasi untuk selengkapnya"
        })

        await Fcm.send(reader, notification, "notification")

        consultation = await this.detail(consultation)

        return response.success(consultation)
    }

    /**
     * get reader who has been booked by santri
     *
     * @method bookedReader
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async bookedReader({auth, response}) {
        const user = await auth.getUser()
        const consultation = Database
            .from('consultations')
            .where('user_id', user.id)

        const readers = await User.query()
            .whereIn('id', consultation.select('reader_id'))
            .with('profile')
            .with('aggregatorProfile')
            .with('role')
            .fetch()

        for (let i = 0; i < readers.length; i++) {
            let subquery = Database.from('aggregator_readers')
                .where('reader_id', readers[i].id)
                .select('aggregator_id')
            readers[i].aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)
        }

        return response.success(readers)
    }

    /**
     * get next consultations for santri
     *
     * @method nextConsultation
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async nextConsultation({auth, response}) {
        const now = new Date()
        const date = `${now.getFullYear()}-${(now.getMonth() + 1)}-${now.getDate()}`
        const user = await auth.getUser()
        const consultations = await Consultation.query()
            .where('user_id', user.id)
            .where('date', '>', date)
            .orderBy('id', 'asc')
            .first()

        if (consultations == null) return response.success(null)

        return response.success(await this.detail(consultations))
    }
}


module.exports = ConsultationController
