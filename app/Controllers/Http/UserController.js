'use strict'

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin')

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../Models/UserProfile')} */
const UserProfile = use('App/Models/UserProfile')

/** @type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile')

/** @type {typeof import('../../Models/AggregatorMentor')} */
const AggregatorReader = use('App/Models/AggregatorReader')

/** @type {typeof import('../../Models/UserAttachment')} */
const UserAttachment = use('App/Models/UserAttachment')

/** @type {typeof import('../../Models/MentorJoinRequest')} */
const ReaderJoinRequest = use('App/Models/ReaderJoinRequest')

/** @type {typeof import('../../Models/Notification')} */
const Notification = use('App/Models/Notification')

/** @type {typeof import('../../Models/CostDistribution')} */
const Cost = use('App/Models/CostDistribution')

/** @type {typeof import('../../Models/UserBalance')} */
const Balance = use('App/Models/UserBalance')

/** @type {typeof import('../../Helpers/Tokenizer')} */
const Tokenizer = use('App/Helpers/Tokenizer')

/** @type {typeof import('../../Helpers/Fcm')} */
const Fcm = use('App/Helpers/Fcm')

/** @type {typeof import('../../Helpers/Confirmation')} */
const Confirmation = use('App/Helpers/Confirmation')

/** @type {typeof import('../../Helpers/Uploader')} */
const Uploader = use('App/Helpers/Uploader')

/** @type {typeof import('../../Models/UserReferral')} */
const UserReferral = use('App/Models/UserReferral')

/** @type {typeof import('../../Models/UserVoucher')} */
const UserVoucher = use('App/Models/UserVoucher')

/** @type {typeof import('../../Models/Category')} */
const Category = use('App/Models/TarotCategory')

/** @type {typeof import('../../Helpers/OAuth')} */
const OAuth = use('App/Helpers/OAuth')

/**
 * User Controller
 *
 * @class UserController
 */
class UserController {

    /**
     * register new User
     *
     * @method register_user
     * @async
     *
     * @param userPayload
     * @param profilePayload
     * @param auth
     * @param attachmentPayload
     * @param aggregator_id
     * @param aggregatorPayload
     * @param aggregator
     * @param isRequest
     * @param categoryIds
     * @param referral
     * @returns {Promise<{data: null, message: string, status: boolean}|{data: *, message: string, status: boolean}>}
     */
    async register_user({userPayload, profilePayload, auth, attachmentPayload, aggregator_id, aggregatorPayload, aggregator, referral, categoryIds}, isRequest = false) {
        if (userPayload.status == null) userPayload.status = 'inactive'
        userPayload.is_approved = !(userPayload.role_id == 3 && isRequest)
        const totalAccount = await User.query()
            .where('email', userPayload.email)
            .orWhere('username', userPayload.username)
            .getCount()

        if (totalAccount > 0) return {
            status: false,
            message: "Username or Email has been registered in another account",
            data: null
        }

        if (aggregator_id != null && userPayload.role_id == 2 && aggregator == null) {
            const aggregator = await User.find(aggregator_id)

            if (aggregator == null || aggregator.role_id != 3) return {
                status: false,
                message: "Aggregator Not Found",
                data: null
            }

            if (!aggregator.is_approved) return {
                status: false,
                message: "Aggregator has been not verified by admin",
                data: null
            }
        }

        const user = await User.create(userPayload)

        await Balance.create({user_id: user.id, balance: 0})
        await UserReferral.createFromUser(user)

        /**
         * Create user profile & referral voucher
         */
        if (user.role_id == 1) {
            user.profile().create(profilePayload)
            if (referral != null && referral != "") {
                const refUser = await UserProfile.query()
                    .where('user_id', Database.from("user_referrals").where("referral_code", referral).select("user_id"))
                    .first()

                await UserVoucher.create({
                    user_id: user.id,
                    voucher_code: referral,
                    type: 2,
                    title: "Referral Voucher",
                    description: `Referral Voucher From ${refUser.name}`,
                    value: 50,
                    used: false
                })
            }
        }

        /**
         * Create Reader Profile
         *
         * - insert profile
         * - insert schedules
         * - insert attachment
         * - insert aggregator_reader
         */
        if (user.role_id == 2) {

            user.profile().create(profilePayload)
            await user.attachment().create(attachmentPayload)

            const schedulePayloads = []
            for (let i = 1; i <= 7; i++) {
                schedulePayloads.push({
                    start_time: "08:00:00",
                    end_time: "16:00:00",
                    day: i
                })
            }
            await user.schedules().createMany(schedulePayloads)

            const specializationPayloads = []
            for (let id of categoryIds) {
                if (await Category.find(id) == null) return {
                    status: false,
                    message: "Category not found",
                    data: null
                }
                specializationPayloads.push({category_id: id})
            }
            await user.specialization().createMany(specializationPayloads)

            if (aggregator_id != null) {
                await Database
                    .insert({
                        reader_id: user.id,
                        aggregator_id: aggregator_id
                    })
                    .into('aggregator_readers')
            }

            if (isRequest) {
                const readerRequest = await ReaderJoinRequest.create({
                    reader_id: user.id,
                    aggregator_id: aggregator_id
                })

                const reader_notification = await Notification.create({
                    user_id: user.id,
                    type: 3,
                    parent_id: readerRequest.id,
                    title: "Submission was send",
                    message: "Data anda sedang di review oleh tim"
                })

                const aggregator_notification = await Notification.create({
                    user_id: aggregator_id,
                    type: 3,
                    parent_id: readerRequest.id,
                    title: "Reader has been submit request",
                    message: "Seseorang telah request untuk menjadi reader anda"
                })

                if (reader_notification.fcm != null) await Fcm.send(user, reader_notification, "notificaiton")
                if (aggregator_notification.fcm != null) await Fcm.send(aggregator, aggregator_notification, "notification")
            }
        }

        /**
         * Create Aggregator Profile
         *
         * - insert attachment
         * - insert aggregator profile
         * - create distribution cost
         */
        if (user.role_id == 3) {
            await user.attachment().create(attachmentPayload)
            await user.aggregatorProfile().create(aggregatorPayload)
            await Cost.create({aggregator_id: user.id})
        }

        let jwt = await auth.withRefreshToken().attempt(user.email, userPayload.password)
        await Confirmation.send(jwt, user)

        return {
            status: true,
            message: "",
            data: user
        }
    }

    /**
     * get reader detail
     *
     * @param reader
     * @returns {Promise<*>}
     */
    async reader_detail(reader) {
        let subquery = Database.from('aggregator_readers')
            .where('reader_id', reader.id)
            .select('aggregator_id')

        reader.aggregatorProfile = await AggregatorProfile.findBy('user_id', subquery)
        reader.attachment = await UserAttachment.findBy('user_id', reader.id)
        reader.specialization = await Category.query()
            .whereIn("id", Database.from("reader_specializations").where("reader_id", reader.id).select("category_id"))
            .fetch()

        reader.avg_price = Math.round(reader.avg_price)
        reader.avg_paid = 0
        reader.avg_income = 0

        return reader
    }

    /**
     * customize paginate
     *
     * @method custom_paginate
     *
     * @param users
     * @param page
     * @returns {{total: number, perPage: number, lastPage: number, data: *[], page: number}}
     */
    custom_paginate(users = [], page = 1) {
        if (page == "") page = 1
        const perPage = 20
        const total = users.length
        return {
            total: total,
            perPage: perPage,
            page: page,
            lastPage: Math.ceil(total / perPage),
            data: users.slice((page - 1) * perPage, perPage * page)
        }
    }

    /**
     * get user list
     *
     * @method index
     * @async
     *
     * @param auth
     * @param request
     * @returns {Promise<{total: number, perPage: number, lastPage: number, data: *[], page: number}>}
     */
    async index({auth, request}) {

        /**
         * get params
         */
        const {type: userType} = request.get()
        const user = await auth.getUser()
        const page = request.input('page', 1)
        const keyword = request.input('searchKeyword', '')
        const status = request.input('status')
        const is_approved = request.input('is_approved', true)
        const category_id = request.input("category_id")

        /**
         * Build query
         */
        const getQuery = () => {
            let query = User.query()
                .select(Database.raw(User.select_average_query(user)))
                .where('username', 'LIKE', `%${keyword}%`)
                .where('is_approved', is_approved != "" ? is_approved : true)
                .with('profile')
                .with('aggregatorProfile')
                .with('role')
                .orderBy('avg_price', 'ASC')

            if (status != null && status != "") query = query.where('status', status)
            if (category_id != null && category_id != "") query = query.whereIn("id", Database.from("reader_specializations").where("category_id", category_id).select("reader_id"))

            /**
             * if provided token is aggregator
             * and user type is reader
             *
             * then set query to reader who joined that aggregator
             */
            if (user.role_id == 3 && userType == 2) {
                query.whereIn('id', Database.from('aggregator_readers').where('aggregator_id', user.id).select('reader_id'))
            }

            if (!isNaN(userType) && userType != "") query = query.where('role_id', userType)

            return query
        }

        let users = (await getQuery().fetch()).toJSON()

        /**
         * customize paginate
         * @type {{total: number, perPage: number, lastPage: number, data: *[], page: number}}
         */
        users = this.custom_paginate(users, page)

        for (let i = 0; i < users.data.length; i++) {
            if (users.data[i].role_id == 2) users.data[i] = await this.reader_detail(users.data[i])
            else if (users.data[i].role_id == 1) {
                users.data[i].avg_paid = Math.round(users.data[i].avg_paid)
                users.data[i].avg_price = 0
                users.data[i].avg_income = 0
            }
            else  {
                users.data[i].avg_income = Math.round(users.data[i].avg_income)
                users.data[i].avg_price = 0
                users.data[i].avg_paid = 0
            }
        }

        return users
    }

    /**
     * register user
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
        const userPayload = request.only(["username", "email", "password", "role_id", "aggregator_id"])
        const profilePayloads = request.only(["name", "date_of_birth", "place_of_birth", "education", "occupation", "marriage_satus", "phone_number", "address", "location", "district_id", "city_id", "province_id"])

        return response.json(await this.register_user({
            userPayload: userPayload,
            profilePayload: profilePayloads,
            auth: auth,
            referral: request.input("referral_code")
        }, true))
    }

    /**
     * register user
     *
     * @method store
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async registerWithSocial({auth, request, response}) {
        const oAuth = await OAuth.detail(request.input("access_token", ""), request.input("type"))
        if (!oAuth.status) return response.error(oAuth.message)

        const date = new Date()
        let name = oAuth.email.split("@")[0]
        name = `${name}${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}`

        const userPayload = {
            email: oAuth.email,
            password: "semuasama",
            role_id: 1,
            username: name
        }

        return response.json(await this.register_user({
            userPayload: userPayload,
            profilePayload: {username: name},
            auth: auth,
            referral: request.input("referral_code")
        }, true))
    }

    /**
     * request join by reader to aggregator
     *
     * @method saveByUsername
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*|{data: null, message: string, status: boolean}>}
     */
    async saveByUsername({auth, params, request, response}) {
        const attachmentPayloads = {
            ktp: await Uploader.user_attachment(request.file("ktp")),
            ijazah: await Uploader.user_attachment(request.file("ijazah")),
            license: await Uploader.user_attachment(request.file("license"))
        }

        const userPayload = request.only(["username", "email", "password", "role_id", "aggregator_id"])
        const profilePayloads = request.only(["name", "date_of_birth", "place_of_birth", "education", "occupation", "marriage_satus", "phone_number", "address", "location", "district_id", "city_id", "province_id"])
        const aggregatorPayload = request.only(["name", "address"])
        const categoryIds = request.input("category_id", [])
        aggregatorPayload.isCommunity = false

        userPayload.role_id = 2

        const aggregator = await User.findBy("username", params.username)
        if (aggregator == null || aggregator.role_id != 3) return {
            status: false,
            message: "Aggregator Not Found",
            data: null
        }

        return response.json(await this.register_user({
            userPayload: userPayload,
            profilePayload: profilePayloads,
            aggregator: aggregator,
            aggregatorPayload: aggregatorPayload,
            attachmentPayload: attachmentPayloads,
            auth: auth,
            referral: null,
            categoryIds: categoryIds
        }, true))
    }

    /**
     * register user by admin / aggregator
     * - aggregator can only register reader
     * - admin can create all user
     *
     * @method save
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async save({auth, request, response}) {
        const authUser = await auth.getUser()

        if (authUser instanceof User && authUser.role_id != 3) return response.json({
            status: false,
            message: "Forbidden Access",
            data: null
        })

        const attachmentPayloads = {
            ktp: await Uploader.user_attachment(request.file("ktp")),
            ijazah: await Uploader.user_attachment(request.file("ijazah")),
            license: await Uploader.user_attachment(request.file("license"))
        }

        const userPayload = request.only(["username", "email", "password", "role_id"])
        userPayload.is_approved = true
        userPayload.status = 'active'
        const profilePayloads = request.only(["name", "date_of_birth", "place_of_birth", "education", "occupation", "marriage_satus", "phone_number", "address", "location", "district_id", "city_id", "province_id"])
        const aggregatorPayload = request.only(["name", "address", "isCommunity"])
        const categoryIds = request.input("category_id", [])

        let aggregator_id

        if (authUser instanceof User) aggregator_id = authUser.id
        else aggregator_id = request.input("aggregator_id")

        if (authUser instanceof User && authUser.role_id == 3) userPayload.role_id = 2

        return response.json(await this.register_user({
            userPayload: userPayload,
            profilePayload: profilePayloads,
            aggregatorPayload: aggregatorPayload,
            attachmentPayload: attachmentPayloads,
            auth: auth,
            aggregator_id: aggregator_id,
            categoryIds: categoryIds,
            referral: request.input("referral_code")
        }))
    }

    /**
     * get user detail
     *
     * @param user
     * @returns {Promise<*>}
     */
    async get_user_detail(user) {
        await user.load('role')

        if (user.role_id == 3) {
            user.avg_price = 0
            user.avg_paid = 0
            await user.load('aggregatorProfile')
            user.attachment = await UserAttachment.findBy('user_id', user.id)
        } else {
            await user.load('profile')
            if (user.role_id == 2) user = await this.reader_detail(user)
            else {
                user.avg_price = 0
                user.avg_income = 0
            }
        }
        return user
    }

    /**
     * show user detail
     *
     * @method show
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<*>}
     */
    async show({auth, params, response}) {
        const authUser = await auth.getUser()
        const user = await User.query()
            .select(Database.raw(User.select_average_query(authUser)))
            .where('id', params.id)
            .first()

        if (user == null) return response.notFound("User")

        const result = await this.get_user_detail(user)

        if (authUser.id == params.id) {
            const balance = await Balance.findBy("user_id", params.id)
            result.balance = balance.balance
        }

        return response.success(result)
    }

    /**
     * update user
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<{message: string, user: *}|*>}
     */
    async update({auth, params, request, response}) {
        const authenticatedUser = await auth.getUser()
        let authorized = authenticatedUser instanceof Admin

        if (authenticatedUser instanceof User) {
            if (params.id === authenticatedUser.id) authorized = true
            else authorized = (await AggregatorReader.query()
                .where('aggregator_id', authenticatedUser.id)
                .where('reader_id', params.id)
                .fetch()).toJSON().length != 0
        }

        if (!authorized) return response.forbidden()

        let user = await User.find(params.id)
        if (user == null) return response.notFound("User")

        user.merge({
            email: request.input('email', user.email),
            username: request.input('username', user.username),
            password: request.input('password', user.password)
        })

        await user.save()
        user = await this.get_user_detail(user)

        user = await User.query()
            .select(Database.raw(User.select_average_query(authenticatedUser)))
            .where('id', params.id)
            .first()

        if (authenticatedUser.id == params.id) {
            const balance = await Balance.findBy("user_id", params.id)
            user.balance = balance.balance
        }

        return response.success(user)
    }

    /**
     * delete user
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

        user = await User.find(params.id)
        if (user == null) return response.notFound("User")

        let delete_queue
        let consultation

        if (user.role_id === 1) {
            delete_queue = [
                ["notifications", "user_id"],
                ["user_profiles", "user_id"],
                ["user_tokens", "user_id"],
                ["user_referrals", "user_id"]
            ]
            consultation = Database.from('consultations').where('user_id', user.id)
        } else if (user.role_id === 2) {
            delete_queue = [
                ["user_profiles", "user_id"],
                ["aggregator_readers", "reader_id"],
                ["notifications", "user_id"],
                ["user_tokens", "user_id"],
                ["reader_schedules", "reader_id"],
                ["user_referrals", "user_id"]
            ]
            consultation = Database.from('consultations').where('reader_id', user.id)
        } else {
            delete_queue = [
                ["aggregator_profiles", "user_id"],
                ["aggregator_readers", "aggregator_id"],
                ["notifications", "user_id"],
                ["user_profiles", "user_id"],
                ["user_tokens", "user_id"],
                ["cost_distributions", "aggregator_id"],
                ["user_referrals", "user_id"]
            ]
        }

        for (let x of delete_queue) {
            try {
                await Database.table(x[0])
                    .where(x[1], '=', user.id)
                    .delete()
            } catch (e) {
                return response.error(e.detail)
            }
        }

        try {
            if (consultation != null) {
                await Database.from('payments')
                    .whereIn('consultation_id', consultation.select('id'))
                    .delete()
                await Database.from('consultation_notes')
                    .whereIn('consultation_id', consultation.select('id'))
                    .delete()
                await Database.from('consultation_chats')
                    .whereIn('consultation_id', consultation.select('id'))
                    .delete()
                await Database.from('consultation_vouchers')
                    .whereIn('consultation_id', consultation.select('id'))
                    .delete()
                await consultation.delete()
            }
        } catch (e) {
        }

        try {
            await user.delete()
        } catch (e) {
            return response.error(e.detail)
        }

        return response.success(null)
    }

    /**
     * update user fcm
     *
     * @method fcm
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async fcm({request, response}) {
        const token = request.headers().originalAuthorization
        await Tokenizer.updateFcm(token, request.input('fcm'))
        return response.success(null)
    }

    /**
     * update user socketId
     *
     * @method socketId
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async socketId({request, response}) {
        const token = request.headers().originalAuthorization
        await Tokenizer.updateSocker(token, request.input('socket_id'))
        return response.success(null)
    }

    /**
     * get user socket ids
     *
     * @async
     * @method getSocket
     *
     * @param request
     * @param response
     * @return {Promise<void|*>}
     */
    async getSocket({params, response}) {
        return response.success(await Tokenizer.getSockets(params.user_id))
    }
}

module.exports = UserController
