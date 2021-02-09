'use strict'

/**@type {typeof import('../../Models/Faq')} */
const Faq = use('App/Models/Faq')

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/**
 * Faq Controller
 *
 * @class FaqController
 */
class FaqController {

    /**
     * show faq list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        const page = request.input('page', 1)
        return response.json(Object.assign({
            status: true,
            message: ""
        }, await Faq.query().paginate(page)));
    }

    /**
     * create faq
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
        const user = await auth.getUser()
        if (user instanceof User) return response.forbidden()

        const faq = await Faq.create(request.all())
        return response.success(faq)
    }

    /**
     * show faq detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const faq = await Faq.find(params.id)
        if (faq == null) return response.notFound("Faq")
        return response.success(faq)
    }

    /**
     * update faq
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
        const user = await auth.getUser()
        if (user instanceof User) return response.forbidden()

        const faq = await Faq.find(params.id)
        if (faq == null) return response.notFound("Faq")

        faq.merge(request.all())
        await faq.save()

        return response.success(faq)
    }

    /**
     * delete faq
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
        if (user instanceof User) return response.forbidden()

        await Faq.query()
            .where('id', params.id)
            .delete()

        return response.success(faq)
    }

}

module.exports = FaqController
