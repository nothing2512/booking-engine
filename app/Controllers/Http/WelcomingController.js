'use strict';

/** @type {typeof import('../../Models/Welcoming')} */
const Welcoming = use('App/Models/Welcoming');

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/** @type {typeof import('../../Helpers/Uploader')} */
const Uploader = use('App/Helpers/Uploader');

/**
 * Welcoming Message Controller
 *
 * @class WelcomingController
 */
class WelcomingController {

    /**
     * get welcoming list
     *
     * @method index
     * @async
     *
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({response}) {
        return response.success(await Welcoming.all())
    }

    /**
     * show welcoming messages detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const cms = await Welcoming.find(params.id);
        if (cms == null) return response.notFound("Welcoming");
        return response.success(cms)
    }

    /**
     * create welcoming message
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
        const user = await auth.getUser();
        if (user instanceof User && user.role_id != 3) return response.forbidden();

        const payload = request.only(["title", "type", "description"]);
        payload.image = await Uploader.welcoming(request.file("image"));

        return response.success(await Welcoming.create(payload))
    }

    /**
     * update welcoming message
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({auth, params, request, response}) {
        const user = await auth.getUser();
        if (user instanceof User && user.role_id != 3) return response.forbidden();

        const cms = await Welcoming.find(params.id);
        if (cms == null) return response.notFound("Welcoming CMS");

        const payload = request.only(["title", "type", "description"]);
        const image = await Uploader.welcoming(request.file("image"));
        if (image != null) payload.image = image;

        cms.merge(payload);
        await cms.save();

        return response.success(cms)
    }

    /**
     * delete welcoming message
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
        if (user instanceof User && user.role_id != 3) return response.forbidden();
        await Welcoming.query().where('id', params.id).delete();
        return response.success(null)
    }
}

module.exports = WelcomingController;
