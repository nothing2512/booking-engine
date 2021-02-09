'use strict';

/**@type {typeof import('../../Models/Intro')} */
const Intro = use('App/Models/Intro');

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/**
 * Intro Controller
 *
 * @class IntroController
 */
class IntroController {

    /**
     * get intro detail
     *
     * @method detail
     * @async
     *
     * @param intro
     * @returns {Promise<*>}
     */
    async detail(intro) {

        const now = new Date();
        const dob = new Date(intro.date_of_birth);
        const age = new Date(now - dob);

        intro.age = age.getUTCFullYear() - 1970;

        const user = await User.find(intro.user_id);
        user.profile = user.profile().fetch();

        intro.user = user;

        return intro
    }

    /**
     * get intro list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {

        const page = request.input('page', 1);
        const result = [];

        let intros = await Intro.query().paginate(page);

        intros = Object.assign({
            status: true,
            message: ""
        }, intros);

        for (let intro of intros.rows) result.push(await this.detail(intro));

        intros.rows = result;

        return response.json(intros)
    }

    /**
     * create user intro
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

        const intro = await Intro.create({
            user_id: user.id,
            date_of_birth: request.input('date_of_birth')
        });

        return response.success(await this.detail(intro))
    }

    /**
     * show intro detail
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
        const intro = await Intro.find(params.id);
        if (intro == null) return response.notFound("Intro");

        const user = await auth.getUser();
        if (user instanceof User && user.id != intro.user_id) return response.forbidden();

        return response.success(await this.detail(intro))
    }

    /**
     * update intro date
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*|{data: Promise<*>, message: string, status: boolean}>}
     */
    async update({auth, params, request, response}) {
        const user = await auth.getUser();

        const intro = await Intro.find(params.id);
        if (intro == null) return response.notFound("Intro");

        if (user instanceof User && user.id != intro.user_id) return response.forbidden();

        intro.merge(request.all());
        await intro.save();

        return response.success(this.detail(intro))
    }

    /**
     * remove intro
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

        const intro = await Intro.find(params.id);
        if (intro == null) return response.notFound("Intro");

        if (user instanceof User && user.id != intro.user_id) return response.forbidden();

        await intro.delete();

        return response.success(null)
    }
}

module.exports = IntroController;
