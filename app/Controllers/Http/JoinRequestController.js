'use strict';

/** @type {typeof import('../../Models/MentorJoinRequest')} */
const MentorJoinRequest = use('App/Models/MentorJoinRequest');

/** @type {typeof import('../../Helpers/Fcm')} */
const Fcm = use('App/Helpers/Fcm');

/** @type {typeof import('../../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/** @type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile');

/** @type {typeof import('../../Models/UserAttachment')} */
const UserAttachment = use('App/Models/UserAttachment');

/** @type {typeof import('../../Models/Notification')} */
const Notification = use('App/Models/Notification');

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/**
 * Join Request Controller
 *
 * @class JoinRequestController
 */
class JoinRequestController {

    /**
     * get user detail
     *
     * @method user_detail
     * @async
     *
     * @param user
     * @returns {Promise<*>}
     */
    async user_detail(user) {

        if (user.role_id == 2) user.profile = await user.profile().fetch();
        else user[`${Engine.lower("aggregator")}Profile`] = await AggregatorProfile.findBy('user_id', user.id);
        user.attachment = await UserAttachment.findBy('user_id', user.id);
        return user
    }

    /**
     * get join request list
     *
     * @method index
     * @async
     *
     * @param auth
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({auth, response}) {
        const user = await auth.getUser();
        const payloads = [];

        if (user instanceof User) {
            if (user.role_id != 3) return response.forbidden()

            const requests = await MentorJoinRequest.query()
                .where(Engine.id("aggregator"), user.id)
                .fetch();

            for (let req of requests.toJSON()) {
                req.user = await this.user_detail(await User.find(req[Engine.id("mentor")]));
                payloads.push(req)
            }
        } else {
            const aggregators = await User.query().where("is_approved", false).fetch();
            for (let aggregator of aggregators.toJSON()) payloads.push(await this.user_detail(aggregator))
        }

        return response.success(payloads)
    }

    /**
     * main reject / approve process
     *
     * @method mainApprovalAction
     * @async
     *
     * @param user
     * @param request_id
     * @param title
     * @param message
     * @param approve
     * @returns {Promise<{data: Promise<*>, message: string, status: boolean}|{data: null, message: string, status: boolean}>}
     */
    async mainApprovalAction(user, request_id, title, message, approve = false) {

        let payload = null;

        if (user instanceof User) {
            if (user.role_id != 3) return {
                status: false,
                message: "Akses ditolak !",
                data: null
            };

            const joinRequest = await MentorJoinRequest.find(request_id);
            if (joinRequest == null) return {
                status: false,
                message: "Permintaan tidak ditemukan",
                data: null
            };

            const mentor = await User.find(joinRequest[Engine.id("mentor")]);

            await joinRequest.delete();

            payload = {};
            payload[Engine.id("mentor")] = Engine.id("mentor")
            payload[Engine.id("aggregator")] = Engine.id("aggregator")

            if (approve) await Database.insert(payload).into(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`);

            const mentor_notification = await Notification.create({
                user_id: mentor.id,
                type: 3,
                parent_id: joinRequest.id,
                title: title,
                message: message
            });

            await Fcm.send(mentor, mentor_notification, "notification");

            payload = mentor
        } else {
            const aggregator = await User.find(request_id);
            if (aggregator == null) return {
                status: false,
                message: `${Engine.title("aggregator")} tidak ditemukan`,
                data: null
            };

            aggregator.merge({is_approved: approve});
            await aggregator.save();

            payload = aggregator
        }

        return {
            status: true,
            message: "Success",
            data: this.user_detail(payload)
        }
    }

    /**
     * approve reader / aggregator join request
     *
     * @method approve
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async approve({auth, params, response}) {

        const user = await auth.getUser();

        return response.json(await this.mainApprovalAction(
            user,
            params.id,
            "Permintaan bergabung anda telah disetujui",
            `Permintaan anda untuk bergabung dengan ${Engine.lower("aggregator")} telah disetujui`,
            true
        ))
    }

    /**
     * reject reader / aggregator join request
     *
     * @method reject
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async reject({auth, params, response}) {
        const user = await auth.getUser();

        return response.json(await this.mainApprovalAction(
            user,
            params.id,
            "Permintaan bergabung anda telah ditolak",
            `Permintaan anda untuk bergabung dengan ${Engine.lower("aggregator")} telah ditolak`
        ))
    }
}

module.exports = JoinRequestController;
