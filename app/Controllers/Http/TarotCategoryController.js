'use strict';


const
    /**@type {typeof import('../../Models/Category')} */
    TarotCategory = use('App/Models/TarotCategory'),

    /** @type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader')

/**
 * TarotCategory Controller
 *
 * @class TarotCategoryController
 */
class TarotCategoryController {

    /**
     * get tarot list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        let page = request.input('page')
        if (isNaN(page)) page = 1

        return response.json(Object.assign({
            status: true,
            message: ""
        }, await TarotCategory.query().paginate(page)))
    }

    /**
     * create / insert tarot
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const payload = request.all()
        payload.image = await Uploader.tarot(request.file("image"))
        const tarot = await TarotCategory.create(payload)
        return response.success(tarot)
    }

    /**
     * show tarot detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        let tarot = await TarotCategory.find(params.id)
        if (tarot == null) return response.notFound("Tarot Category")
        return response.success(tarot)
    }

    /**
     * update tarot
     *
     * @method update
     * @async
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({params, request, response}) {
        const tarot = await TarotCategory.find(params.id);
        if (tarot == null) return response.notFound("Tarot Category")

        tarot.merge(request.all())
        const image = Uploader.tarot(request.file("image"))
        if (image != null) tarot.image = image

        await tarot.save();
        return response.success(tarot)
    }

    /**
     * delete tarot
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        const tarot = await TarotCategory.find(params.id)
        if (tarot !== null) await tarot.delete()
        return response.success(null)
    }
}

module.exports = TarotCategoryController;
