'use strict';

/**@type {typeof import('../../Models/Notification')} */
const Notification = use('App/Models/Notification');

/**@type {typeof import('../../Models/Consultation')} */
const Consultation = use('App/Models/Consultation');

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/**@type {typeof import('../../Helpers/Fcm')} */
const Fcm = use('App/Helpers/Fcm');

/**@type {typeof import('../../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**@type {typeof import('../../Helpers/Payment')} */
const Payment = use('App/Helpers/Payment');

/**
 * Notification Controller
 *
 * @class NotificationController
 */
class NotificationController {

    /**
     * get notification detail
     *
     * @method detail
     * @async
     *
     * @param notification
     * @returns {Promise<*>}
     */
    async detail(notification) {
        if (notification.type != 3) {
            const consultation = await Consultation.find(notification.parent_id);
            const mentor = await consultation.mentor().fetch();
            const cuser = await consultation.user().fetch();
            cuser.profile = await cuser.profile().fetch();
            mentor.profile = await mentor.profile().fetch();

            if (consultation.status === 0) {
                const payment = await consultation.payment().fetch();
                const midtrans = await Payment.check(payment.midtrans_transaction_id);

                if (midtrans.transaction_status == "settlement") {
                    consultation.merge({status: 1});
                    await consultation.save();
                    notification.title = "Consultation has been paid";
                    notification.message = `Anda telah membayar ${Engine.lower("mentor")}, periksa jadwal konsultasi sekarang juga`;
                    await Notification.query()
                        .where('user_id', consultation.user_id)
                        .where('parent_id', consultation.id)
                        .update({
                            title: notification.title,
                            message: notification.message
                        });
                    const user = await User.find(consultation.user_id);
                    await Fcm.send(user, notification, "notification")
                } else if (midtrans.transaction_status == "expire") {

                    consultation.merge({status: 3});
                    await consultation.save();

                    notification.title = "Consultation has been expired";
                    notification.message = "Jadwal Konsultasi anda telah kadaluarsa";
                    await Notification.query()
                        .where('user_id', consultation.user_id)
                        .where('parent_id', consultation.id)
                        .update({
                            title: notification.title,
                            message: notification.message
                        });

                    const user = await User.find(consultation.user_id);
                    await Fcm.send(user, notification, "notification")
                }
            }

            notification.consultation = consultation;
            notification[Engine.lower("mentor")] = mentor
            notification.user = cuser
        }

        return notification
    }

    /**
     * get notification list
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
        let user = await auth.getUser();
        const {type} = request.all();

        let notifications;

        if (!(user instanceof User)) {
            user = await User.find(request.input('user_id'), 0);
            if (user == null) return response.notFound("User")
        }

        if (isNaN(type)) notifications = (await user.notifications()
            .orderBy('id', 'desc')
            .where('type', '<>', 3)
            .fetch()).toJSON();
        else notifications = (await user.notifications()
            .orderBy('id', 'desc')
            .where('type', type)
            .fetch()).toJSON();

        for (let x = 0; x < notifications.length; x++) notifications[x] = await this.detail(notifications[x]);

        return response.success(notifications)
    }

    /**
     * delete notification
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
        const notification = await Notification.find(params.id);

        if (notification == null) return response.notFound("Notification");

        if (user instanceof User && user.id != notification.user_id) return response.forbidden();

        await notification.delete();

        return response.success(null)
    }
}

module.exports = NotificationController;
