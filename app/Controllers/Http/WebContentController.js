'use strict'

/** @type {typeof import('../../Models/WebContent')} */
const WebContent = use('App/Models/WebContent')

/**
 * Web Content Controller
 *
 * @class WebContent
 */
class WebContentController {

    /**
     * get web content list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        return response.json(Object.assign({
            status: true,
            message: ""
        }, await WebContent.query().paginate(request.input('page', 1))))
    }

    /**
     * create web content
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const content = await WebContent.create(request.all())
        return response.success(content)
    }

    /**
     * show web content detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const content = await WebContent.find(params.id)
        if (content == null) return response.notFound("Web Content")
        return response.success(content)
    }

    /**
     * update web content
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
        const content = await WebContent.find(params.id)

        if (content == null) return response.notFound("Web Content")

        content.merge(request.all())
        await content.save()

        return response.success(content)
    }

    /**
     * delete web content
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        await WebContent.query().where('id', params).delete()
        return response.success(null)
    }
}

module.exports = WebContentController
