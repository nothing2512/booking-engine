'use strict';

const
    /**@type {typeof import('../../Models/Consultation')} */
    Consultation = use('App/Models/Consultation'),

    /**@type {typeof import('../../Models/ConsultationChat')} */
    ConsultationChat = use('App/Models/ConsultationChat'),

    /**@type {typeof import('../../Helpers/Fcm')} */
    Fcm = use('App/Helpers/Fcm'),

    /**@type {typeof import('../../Helpers/SocketUtil')} */
    SocketUtil = use('App/Helpers/SocketUtil'),

    /**@type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader'),

    /**@type {typeof import('../../Helpers/Engine')} */
    Engine = use('App/Helpers/Engine'),

    /** @type {import('@adonisjs/lucid/src/Database')} */
    Database = use('Database'),

    /**@type {typeof import('../../Models/AggregatorMentor')} */
    AggregatorMentor = use('App/Models/AggregatorMentor');

class ConsultationChatController {

    /**
     * get consultation detail
     *
     * @async
     * @method consultation_detail
     *
     * @param consultation
     * @return {Promise<*>}
     */
    async consultation_detail(consultation) {
        const user = await consultation.user().fetch();
        const mentor = await consultation.mentor().fetch();
        mentor.profile = await mentor.profile().fetch();
        user.profile = await user.profile().fetch();
        consultation[Engine.lower("mentor")] = mentor;
        consultation.user = user;

        consultation.chats = await consultation.chats().orderBy('created_at', 'asc').fetch();

        return consultation
    }

    /**
     * get all chat history
     *
     * @param auth
     * @param request
     * @param response
     * @return {Promise<void>}
     */
    async index({auth, request, response}) {
        const page = request.input("page", 1);
        const user = await auth.getUser();

        let user_id = user.id;

        let column = user.role_id == 1 ? "user_id" : Engine.id("mentor");
        if (user.role_id == 3) {
            const total = await AggregatorMentor.query()
                .where(Engine.id("mentor"), request.input(Engine.id("mentor")))
                .where(Engine.id("aggregator"), user.id)
                .getCount();

            if (total == 0) return response.forbidden();
            else user_id = request.input(Engine.id("mentor"))
        }
        const consultations = await Consultation.query()
            .where(column, user_id)
            .whereIn("id", Database.from("consultation_chats").select("consultation_id"))
            .orderBy("created_at", "desc")
            .paginate(page);

        const result = Object.assign({
            status: true,
            message: ""
        }, consultations);

        for (let i = 0; i < result.rows.length; i++) result.rows[i] = await this.consultation_detail(result.rows[i]);

        return response.json(result)
    }

    /**
     * show all chats
     *
     * @async
     * @method show
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @return {Promise<void|*>}
     */
    async show({auth, params, request, response}) {
        const authUser = await auth.getUser();
        const consultation = await Consultation.find(params.id);
        if (consultation == null) return response.notFound("Consultation");

        if (authUser.role_id == 1 && authUser.id != consultation.user_id) return response.forbidden();
        if (authUser.role_id == 2 && authUser.id != consultation[Engine.id("mentor")]) return response.forbidden();
        if (authUser.role_id == 3) {
            const total = await AggregatorMentor.query()
                .where(Engine.id("mentor"), request.input(Engine.id("mentor")))
                .where(Engine.id("aggregator"), authUser.id)
                .getCount();

            if (total == 0) return response.forbidden()
        }

        return response.success(await this.consultation_detail(consultation))
    }

    /**
     * send chat
     *
     * @async
     * @method store
     *
     * @param auth
     * @param request
     * @param params
     * @param response
     * @return {Promise<void|*>}
     */
    async store({auth, request, params, response}) {
        const authUser = await auth.getUser();
        const consultation = await Consultation.find(params.id);
        if (consultation == null) return response.notFound("Consultation");

        if (consultation.status == 3) return response.error("Consultation has been expired");
        if (consultation.status == 2) return response.error("Consultation has been ended");

        if (authUser.role_id == 1 && authUser.id != consultation.user_id) return response.forbidden();
        if (authUser.role_id == 2 && authUser.id != consultation[Engine.id("mentor")]) return response.forbidden();

        const chat = await consultation.chats().create({
            user_id: authUser.id,
            text: request.input("text"),
            attachment: await Uploader.chat(request.file("attachment"))
        });

        let fcmUser;
        if (authUser.role_id == 1) fcmUser = await consultation.mentor().fetch();
        else fcmUser = await consultation.user().fetch();

        await Fcm.send(fcmUser, chat, "chat");

        return response.success(chat)
    }

    /**
     * update chat
     *
     * @async
     * @method update
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @return {Promise<void|*>}
     */
    async update({auth, params, request, response}) {
        const authUser = await auth.getUser();
        const chat = await ConsultationChat.find(params.id);
        if (chat == null) return response.notFound("Chat");

        const consultation = await Consultation.find(chat.consultation_id);
        if (consultation == null) return response.notFound("Consultation");

        if (authUser.role_id == 1 && authUser.id != consultation.user_id) return response.forbidden();
        if (authUser.role_id == 2 && authUser.id != consultation[Engine.id("mentor")]) return response.forbidden();

        if (consultation.status == 3) return response.error("Consultation has been expired");
        if (consultation.status == 2) return response.error("Consultation has been ended");

        const attachment = await Uploader.chat(request.file("attachment"));
        chat.text = request.input("text");
        if (attachment != null) chat.attachment = attachment;

        await chat.save();

        return response.success(chat)
    }

    /**
     * delete chat
     *
     * @async
     * @method destroy
     *
     * @param auth
     * @param params
     * @param response
     * @return {Promise<void|*>}
     */
    async destroy({auth, params, response}) {
        const authUser = await auth.getUser();
        const chat = await ConsultationChat.find(params.id);
        if (chat == null) return response.notFound("Chat");

        const consultation = await Consultation.find(chat.consultation_id);
        if (consultation == null) return response.notFound("Consultation");

        if (authUser.role_id == 1 && authUser.id != consultation.user_id) return response.forbidden();
        if (authUser.role_id == 2 && authUser.id != consultation[Engine.id("mentor")]) return response.forbidden();

        await ConsultationChat.query()
            .where("id", params.id)
            .delete();

        return response.success(null)
    }
}

module.exports = ConsultationChatController;
