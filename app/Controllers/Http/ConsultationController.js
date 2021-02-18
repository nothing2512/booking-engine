'use strict';

const
    /**@type {typeof import('../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../Models/AggregatorProfile')} */
    AggregatorProfile = use('App/Models/AggregatorProfile'),

    /**@type {typeof import('../../Models/AggregatorMentor')} */
    AggregatorMentor = use('App/Models/AggregatorMentor'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /**@type {typeof import('../../Models/UserVoucher')} */
    UserVoucher = use('App/Models/UserVoucher'),

    /**@type {typeof import('../../Models/UserBalance')} */
    UserBalance = use('App/Models/UserBalance'),

    /**@type {typeof import('../../Models/Category')} */
    Category = use('App/Models/Category'),

    /**@type {typeof import('../../Helpers/Payment')} */
    Payment = use('App/Helpers/Payment'),

    /**@type {typeof import('../../Helpers/Engine')} */
    Engine = use('App/Helpers/Engine'),

    /**@type {typeof import('../../Helpers/Fcm')} */
    Fcm = use('App/Helpers/Fcm'),

    /**@type {typeof import('../../Models/Notification')} */
    Notification = use('App/Models/Notification'),

    /**@type {import('../../Helpers/Zoom')} */
    ZoomApi = use('App/Helpers/Zoom'),

    /** @type {import('@adonisjs/lucid/src/Database')} */
    Database = use('Database');

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
            const payment = await consultation.payment().fetch();
            const midtrans = await Payment.check(payment.midtrans_transaction_id);

            if (midtrans.transaction_status == "settlement") {
                consultation.merge({status: 1});
                await consultation.save();
                await Notification.query()
                    .where('user_id', consultation.user_id)
                    .where('parent_id', consultation.id)
                    .delete();
                const user_notification = await Notification.create({
                    user_id: consultation.user_id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation has been paid",
                    message: `Anda telah membayar ${Engine.lower("mentor")}, periksa jadwal konsultasi sekarang juga`
                });
                const user = await User.find(consultation.user_id);
                await Fcm.send(user, user_notification, "notification")
            } else if (midtrans.transaction_status === "expire") {
                consultation.merge({status: 3});
                await consultation.save();

                await Notification.query()
                    .where('user_id', consultation.user_id)
                    .where('parent_id', consultation.id)
                    .delete();
                const user_notification = await Notification.create({
                    user_id: consultation.user_id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation has been expired",
                    message: "Jadwal Konsultasi anda telah kadaluarsa"
                });
                const user = await User.find(consultation.user_id);
                await Fcm.send(user, user_notification, "notification")
            }
        }

        consultation.payment = await consultation.payment().fetch();
        consultation.note = await consultation.note().fetch();
        const cuser = await consultation.user().fetch();
        const mentor = await consultation.mentor().fetch();
        cuser.profile = await cuser.profile().fetch();
        mentor.profile = await mentor.profile().fetch();
        consultation.user = cuser;
        consultation[Engine.lower("mentor")] = mentor;
        consultation.voucher = await consultation.voucher().fetch();
        consultation.chats = await consultation.chats().orderBy('created_at', 'asc').fetch();
        consultation.category = await consultation.category().fetch();
        consultation = consultation.toJSON();

        switch (consultation.payment.method) {
            case 1:
                consultation.payment.name = "BCA";
                break;
            case 2:
                consultation.payment.name = "BNI";
                break;
            case 3:
                consultation.payment.name = "BRI";
                break;
            case 4:
                consultation.payment.name = "Mandiri Bill";
                break;
            case 5:
                consultation.payment.name = "Permata";
                break;
            case 6:
                consultation.payment.name = "Gopay";
                break;
            case 7:
                consultation.payment.name = "BCA KlikPay";
                break;
            case 8:
                consultation.payment.name = "CIMB Clicks";
                break;
            case 9:
                consultation.payment.name = "Danamon Online Banking";
                break;
            case 10:
                consultation.payment.name = "E Pay BRI";
                break;
            case 11:
                consultation.payment.name = "Alfamaret";
                break;
            case 12:
                consultation.payment.name = "Indomaret";
                break;
            case 13:
                consultation.payment.name = "Akulaku";
                break;
            default:
                consultation.payment.name = "BCA";
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
            const date = new Date();
            const now = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`;
            const query = Consultation.query()
                .where('user_id', user.id)
                .where(Database.raw(`date::date < '${now}'::date`))
                .whereIn('status', [0, 1]);

            const consultation = await query.fetch();
            await query.update({status: 3});

            if (user.fcm != null) for (let item of consultation.toJSON()) {
                const notification = await Notification.create({
                    user_id: user.id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Consultation Expired",
                    message: "Jadwal konsultasi anda telah kadaluarsa"
                });
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
        const user = await auth.getUser();
        let {date, user_id, status, approval_status} = request.get();
        let mentor_id = request.input(Engine.id("mentor"));
        let page = request.input('page', 1);
        let consultation = Consultation.query();
        let aggregator_id = null;

        await this.check_expire(user);

        if (user instanceof User) {
            if (user.role_id == 2) mentor_id = user.id;
            else if (user.role_id == 1) user_id = user.id;
            else if (user.role_id == 3) aggregator_id = user.id
        }

        if (aggregator_id != null) consultation = consultation.whereIn(Engine.id("mentor"),
            Database
                .from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
                .where(Engine.id("aggregator"), aggregator_id)
                .select(Engine.id("mentor"))
        );

        if (!isNaN(mentor_id)) consultation = consultation.where(Engine.id("mentor"), mentor_id);

        if (!isNaN(user_id)) consultation = consultation.where('user_id', user_id);
        if (date != null) consultation = consultation.where('date', date);

        if (!isNaN(approval_status)) consultation = consultation.where('approval_status', approval_status);
        else consultation = consultation.where('approval_status', 2);

        if (!isNaN(status)) consultation = consultation.where('status', status);
        else consultation = consultation.where('status', '<>', 0);

        const result = Object.assign({
            status: true,
            message: ""
        }, await consultation.orderBy('status', 'asc').orderBy('date', 'asc').orderBy('time', 'asc').paginate(page));

        for (let i = 0; i < result.rows.length; i++) result.rows[i] = await this.detail(result.rows[i]);

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
        const user = await auth.getUser();
        let {date, user_id} = request.get();
        let mentor_id = request.input(Engine.id("mentor"));
        let consultation = Consultation.query();
        let page = request.input('page', 1);
        let aggregator_id = null;

        await this.check_expire(user);

        if (user instanceof User) {
            if (user.role_id == 2) mentor_id = user.id;
            if (user.role_id == 1) user_id = user.id;
            else if (user.role_id == 3) aggregator_id = user.id
        }

        if (aggregator_id != null) consultation = consultation.whereIn(Engine.id("mentor"),
            Database
                .from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
                .where(Engine.id("aggregator"), aggregator_id)
                .select(Engine.id("mentor"))
        );

        if (!isNaN(mentor_id)) consultation = consultation.where(Engine.id("mentor"), mentor_id);
        if (!isNaN(user_id)) consultation = consultation.where('user_id', user_id);
        if (date != null) consultation = consultation.where('date', date);

        consultation = consultation.where('status', '<>', 3).where('status', '<>', 0).where('approval_status', 2);

        const result = Object.assign({
            status: true,
            message: ""
        }, await consultation.orderBy('status', 'asc').orderBy('date', 'desc').orderBy('time', 'desc').paginate(page));

        for (let i = 0; i < result.rows.length; i++) result.rows[i] = await this.detail(result.rows[i]);

        return response.json(result)
    }

    /**
     * booking mentor / create consultations by user
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

        const params = request.only(["user_id", "date", "time", "price", "voucher_code", "category_id"]);
        params[Engine.id("mentor")] = request.input(Engine.id("mentor"));
        const user = await auth.getUser();
        let voucherPayload = {};

        if (user.status == 'inactive') return response.error("Confirm your email first");

        let userAccess = false;

        if (user instanceof User && user.role_id === 1) userAccess = true;
        if (!userAccess) return response.success(`Just ${Engine.lower("user")} can booking ${Engine.lower("mentor")}`);

        params.user_id = user.id;

        const mentor = await User.find(params[Engine.id("mentor")]);
        if (mentor == null) return response.notFound(Engine.title("mentor"));

        const aggregatorMentor = await AggregatorMentor.findBy(Engine.id("mentor"), params[Engine.id("mentor")]);
        if (aggregatorMentor == null) return response.error(`${Engine.id("mentor")} has been not joined with aggregator`);

        const profile = await AggregatorProfile.findBy("user_id", aggregatorMentor[Engine.id("aggregator")]);
        if (profile == null) return response.notFound(Engine.title("aggregator"));

        const category = await Category.find(params.category_id);
        if (category == null) return response.notFound("Category");

        params.status = 0;
        if (profile.isCommunity === false && isNaN(params.price)) response.error("Please input infaq amount first");
        else params.price = profile[`${Engine.lower("mentor")}_price`];

        if (params.voucher_code != null && params.voucher_code != "") {
            const now = new Date();
            const voucher = await UserVoucher.query()
                .where("voucher_code", params.voucher_code)
                .where("user_id", params.user_id)
                .first();

            if (voucher == null) return response.notFound("Voucher");
            if (voucher.used) return response.error("Voucher has been used in another consultation");
            if (voucher.valid_until != null) {
                if (now > (new Date(voucher.valid_until))) return response.error("Voucher is expired")
            }

            if (voucher.payment_method != "" && voucher.payment_method != null && voucher.payment_method != request.input('payment_method'))
                return response.error("Payment method not allowed for this voucher");

            voucher.merge({used: true});
            await voucher.save();
            let originalPrice = params.price;
            let price = params.price;
            let cashback = 0;

            switch (voucher.type) {
                case 1:
                    price = params.price - voucher.discounts;
                    break;
                case 2:
                    price = params.price * voucher.percentage / 100;
                    break;
                case 3:
                    cashback = params.price - voucher.discounts;
                    break;
                default:
                    cashback = params.price * voucher.percentage / 100;
                    break;
            }

            if (voucher.max_discount != "" && voucher.max_discount != null) {
                if (voucher.max_discount < price) price = voucher.max_discount;
                if (voucher.max_discount < cashback) cashback = voucher.max_discount
            }

            if (price > originalPrice) {
                price = 0;
                params.status = 1
            }
            params.price = price;

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
            };

            if (cashback > 0) {
                const userBalance = await UserBalance.findBy('user_id', params.user_id);
                userBalance.balance += cashback;
                await userBalance.save()
            }
        }

        let consultation_available = await Consultation.query()
            .where(Engine.id("mentor"), mentor.id)
            .where('date', params.date)
            .where('time', params.time)
            .where('approval_status', '<>', 1)
            .getCount();

        if (consultation_available > 0) return response.error(`${Engine.title("mentor")} has been booked by another user in that time`);

        let consultation = await Consultation.create(params);
        let payment;

        if (voucherPayload != {}) await consultation.voucher().create(voucherPayload);

        if (params.price == 0) payment = Payment.free();
        else payment = await Payment.make(
            request.input('payment_method'),
            consultation.id,
            consultation.price,
            `Booking ${Engine.lower("mentor")}`
        );

        await consultation.payment().create({
            midtrans_transaction_id: payment.transaction_id,
            method: request.input('payment_method'),
            price: consultation.price,
            va_number: payment.va_code,
            qr_link: payment.qr_link,
            redirect_link: payment.redirect_link,
            bill_key: payment.bill_key,
            bill_code: payment.bill_code
        });

        consultation = await this.detail(consultation);

        const mentor_notification = await Notification.create({
            user_id: consultation[Engine.id("mentor")],
            type: 1,
            parent_id: consultation.id,
            title: "You have been booked",
            message: user.name + " telah memesan anda, cek jadwal konsultasi untuk selengkapnya"
        });

        const user_notification = await Notification.create({
            user_id: user.id,
            type: 2,
            parent_id: consultation.id,
            title: `Pay your ${Engine.lower("mentor")} now!`,
            message: `Anda telah memesan ${Engine.lower("mentor")}, segera bayar sebelum jatuh tempo`
        });

        if (mentor.fcm != null) await Fcm.send(mentor, mentor_notification, "notification");
        if (user.fcm != null) await Fcm.send(user, user_notification, "notification");

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
        const consultation = await Consultation.find(params.id);
        const user = await auth.getUser();

        if (consultation == null) return response.error("Consultation not found");

        if (user instanceof User) {
            let isAccessible = user.id == consultation.user_id || user.id == consultation[Engine.id("mentor")];
            if (user.role_id == 3) {
                const total = await AggregatorMentor.query()
                    .where(Engine.id("aggregator"), user.id)
                    .where(Engine.id("mentor"), consultation[Engine.id("mentor")])
                    .getCount();
                isAccessible = total > 0
            }

            if (!isAccessible) return response.forbidden()
        }

        return response.success(await this.detail(consultation))
    }

    /**
     * mentor approve / reject user consultation main process
     *
     * @method mentorAction
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @param action
     * @returns {Promise<void|*>}
     */
    async mentorAction({auth, params, response}, action) {
        const mentor = await auth.getUser();
        if (mentor == null) return response.forbidden();

        if (mentor.role_id !== 2) return response.success(`Just ${Engine.lower("mentor")} can perform this action`);

        let consultation = await Consultation.find(params.id);
        if (consultation == null) return response.notFound("Consultation");

        if (consultation[Engine.id("mentor")] != mentor.id) return response.forbidden();

        let zoomResponse = null;

        const fields = {approval_status: action};
        if (action == 2) {
            zoomResponse = await ZoomApi.createMeeting();
            Object.assign(fields, {zoom_join_url: zoomResponse['join_url']})
        }

        consultation.merge(fields);
        await consultation.save();

        const notification = await Notification.create({
            user_id: consultation.user_id,
            type: 1,
            parent_id: consultation.id,
            title: action === 1 ? "Consultation has been rejected" : "Consultation has been approved",
            message: action === 1 ?
                `${Engine.title("mentor")} yang anda booking tidak menyetujui booking anda, mohon cari ${Engine.lower("mentor")} lain` :
                `${Engine.title("mentor")} yang anda booking telah menyetujui booking anda.`
        });

        const user = await User.find(consultation.user_id);
        if (user.fcm != null) await Fcm.send(user, notification, "notification");

        consultation = await this.detail(consultation);

        return response.success(consultation)
    }

    /**
     * mentor reject user consultation
     *
     * @method reject
     * @async
     *
     * @param requests
     * @returns {Promise<*>}
     */
    async reject(requests) {
        return this.mentorAction(requests, 1)
    }

    /**
     * mentor approve user consultation
     *
     * @method approve
     * @async
     *
     * @param requests
     * @returns {Promise<*>}
     */
    async approve(requests) {
        return this.mentorAction(requests, 2)
    }

    /**
     * check replacement mentor is valid or not
     *
     * @method isReplacementValid
     *
     * @param user
     * @param consultation
     * @returns {{data: null, message: string, status: boolean}|{status: boolean}}
     */
    isReplacementValid(user, consultation) {
        let message = "";
        if (consultation == null) message = "Consultation not found";
        if (consultation.status == 0) message = "You has been not pay for this consultation";
        if (consultation.approval_status == 2) message = `Your consultation has been approved by ${Engine.lower("mentor")}`;
        if (consultation.user_id != user.id) message = "Forbidden access";
        if (message !== "") return {
            status: false,
            message: message,
            data: null
        };
        return {status: true}
    }

    /**
     * find replacement mentor by user
     * if consultation has been rejected by mentor
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
        let available = [];
        let aggregator_ids = [];
        let mentor_ids = [];

        const user = await auth.getUser();
        const consultation = await Consultation.find(params.id);

        const valid = this.isReplacementValid(user, consultation);
        if (!valid.status) return response.json(valid);

        let profile = AggregatorProfile.query();
        if (consultation.isCommunity === false) profile = profile.where('price', consultation.price);
        profile = (await profile.fetch()).toJSON();

        for (let x of profile) aggregator_ids.push(x.user_id);

        const aggregator_mentors = (await AggregatorMentor.query().whereIn(Engine.id("aggregator"), aggregator_ids).fetch()).toJSON();
        for (let x of aggregator_mentors) mentor_ids.push(x[Engine.id("mentor")]);

        const mentors = (await User.query()
            .whereIn('id', mentor_ids)
            .where("status", "active")
            .where('id', '<>', consultation[Engine.id("mentor")])
            .with('profile')
            .with('role')
            .fetch()).toJSON();

        for (let x of mentors) {
            let total = await Consultation.query()
                .where('date', consultation.date)
                .where('time', consultation.time)
                .where(Engine.id("mentor"), x.id)
                .getCount();

            let subquery = Database.from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
                .where(Engine.id("mentor"), x.id)
                .select(Engine.id("aggregator"));
            x[`${Engine.lower("aggregator")}Profile`] = await AggregatorProfile.findBy('user_id', subquery);

            if (total === 0) available.push(x)
        }

        return response.success(available)
    }

    /**
     * replace mentor by user
     *
     * @method replaceMentor
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async replaceMentor({auth, request, response}) {
        const user = await auth.getUser();
        let consultation = await Consultation.find(request.input('consultation_id'));

        const valid = this.isReplacementValid(user, consultation);
        if (!valid.status) return response.json(valid);

        const mentor = await User.find(request.input(Engine.id("mentor")));
        if (mentor == null) return response.notFound(Engine.title("mentor"));

        consultation.approval_status = 0;
        consultation[Engine.id("mentor")] = mentor.id;
        await consultation.save();

        const notification = await Notification.create({
            user_id: consultation[Engine.id("mentor")],
            type: 1,
            parent_id: consultation.id,
            title: "You have been booked",
            message: user.name + " telah memesan anda, cek jadwal konsultasi untuk selengkapnya"
        });

        await Fcm.send(mentor, notification, "notification");

        consultation = await this.detail(consultation);

        return response.success(consultation)
    }

    /**
     * get mentor who has been booked by user
     *
     * @method bookedMentor
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async bookedMentor({auth, response}) {
        const user = await auth.getUser();
        const consultation = Database
            .from('consultations')
            .where('user_id', user.id);

        const mentors = await User.query()
            .whereIn('id', consultation.select(Engine.id("mentor")))
            .with('profile')
            .with('role')
            .fetch();

        for (let i = 0; i < mentors.length; i++) {
            let subquery = Database.from(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`)
                .where(Engine.id("mentor"), mentors[i].id)
                .select(Engine.id("aggregator"));
            mentors[i][`${Engine.lower("aggregator")}Profile`] = await AggregatorProfile.findBy('user_id', subquery)
        }

        return response.success(mentors)
    }

    /**
     * get next consultations for user
     *
     * @method nextConsultation
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async nextConsultation({auth, response}) {
        const now = new Date();
        const date = `${now.getFullYear()}-${(now.getMonth() + 1)}-${now.getDate()}`;
        const user = await auth.getUser();
        const consultations = await Consultation.query()
            .where('user_id', user.id)
            .where('date', '>', date)
            .orderBy('id', 'asc')
            .first();

        if (consultations == null) return response.success(null);

        return response.success(await this.detail(consultations))
    }
}

module.exports = ConsultationController;
