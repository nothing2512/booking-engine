'use strict'

/**@type {typeof import('../../Models/NewsCategory')} */
const NewsCategory = use('App/Models/NewsCategory')

/**
 * News Category Controller
 *
 * @class NewsCategory
 *
 */
class NewsCategoryController {

    /**
     * get news category list
     *
     * @method index
     * @async
     *
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({response}) {
        return response.success(await NewsCategory.all())
    }

    /**
     * create news category
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<*>}
     */
    async store({request, response}) {
        const category = await NewsCategory.create(request.all())
        return response.success(category)
    }

    /**
     * show news category detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const category = await NewsCategory.find(params.id)
        if (category == null) return response.notFound("News Category")
        return response.success(category)
    }

    /**
     * update news category
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
        const category = await NewsCategory.find(params.id)
        if (category == null) return response.notFound("News Category")

        category.merge(request.all())
        await category.save()

        return response.success(category)
    }

    /**
     * delete news category
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        await NewsCategory.query().where('id', params.id).delete()
        return response.success(null)
    }

}

module.exports = NewsCategoryController
