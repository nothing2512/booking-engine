'use strict'

/**@type {typeof import('../../Models/News')} */
const News = use('App/Models/News')

/**@type {typeof import('../../Models/NewsCategory')} */
const NewsCategory = use('App/Models/NewsCategory')

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../Helpers/Uploader')} */
const Uploader = use('App/Helpers/Uploader')

/**
 * News Controller
 *
 * @class NewsController
 */
class NewsController {

    /**
     * get news detail
     *
     * @method detail
     * @async
     *
     * @param news
     * @returns {Promise<*>}
     */
    async detail(news) {
        news.category = await NewsCategory.find(news.category_id)
        return news
    }

    /**
     * get news list
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
        const user_id = request.input("user_id")
        const news = []
        let newsQuery = News.query()

        if (!isNaN(user_id)) newsQuery = newsQuery.where('user_id', user_id)
            .where('author_type', request.input('type'))

        const payloads = Object.assign({
            status: true,
            message: ""
        }, await newsQuery.paginate(page))

        for (let item of payloads.rows) news.push(await this.detail(item))

        payloads.rows = news

        return response.json(payloads)
    }

    /**
     * create news
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
        const payloads = request.only(["title", "content", "category_id"])
        payloads.author_id = user.id
        payloads.author_type = user instanceof User ? "user" : "admin"
        payloads.header_image = await Uploader.news(request.file("image"))

        const category = await NewsCategory.find(payloads.category_id)
        if (category == null) return response.notFound("Category")

        const news = await News.create(payloads)

        return response.success(await this.detail(news))
    }

    /**
     * show news detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const news = await News.find(params.id)
        if (news == null ) return response.notFound("News")
        return response.success(await this.detail(news))
    }

    /**
     * update news
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
        const news = await News.find(params.id)
        if (news == null) return response.json({
            status: false,
            message: "News not found",
            data: null
        })

        if (user instanceof User && (user.id != news.author_id || news.author_type != "user"))return response.forbidden()
        else if (!(user instanceof User) && (user.id != news.author_id || news.author_type != "admin"))return response.forbidden()

        const payloads = request.only(["title", "content", "category_id"])
        const header_image = await Uploader.news(request.file("image"))
        if (header_image != null) news.header_image = header_image

        const category = await NewsCategory.find(payloads.category_id)
        if (category == null) return response.notFound("Category")

        news.merge(payloads)
        await news.save()

        return response.success(await this.detail(news))
    }

    /**
     * delete news
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        await News.query().where('id', params.id).delete()
        return response.success(null)
    }

}

module.exports = NewsController
