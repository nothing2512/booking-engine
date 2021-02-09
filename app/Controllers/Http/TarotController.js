'use strict'


const
    /**@type {typeof import('../../Models/Tarot')} */
    Tarot = use('App/Models/Tarot'),

    /**@type {typeof import('../../Models/TarotCategory')} */
    TarotCategory = use('App/Models/TarotCategory'),

    /**@type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader')

/**
 * Tarot Controller
 *
 * @class TarotController
 */
class TarotController {

    /**
     * update queued tarots order
     *
     * @method queue
     * @async
     *
     * @param models
     * @param counter
     * @returns {Promise<void>}
     */
    async queue(models, counter) {
        for (const item of models) {
            let tarot = await Tarot.find(item.id)
            tarot.merge({index: item.index + counter})
            await tarot.save()
        }
    }

    /**
     * get all tarots
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        let page = request.input('page', 1)
        let category_id = request.input('category_id')
        const tarots = []

        let tarot = Tarot.query()
            .orderBy('index', 'asc')

        if (!isNaN(category_id) && category_id != "") tarot = tarot.where('category_id', category_id)

        const payloads = Object.assign({
            status: true,
            message: ""
        }, await tarot.paginate(page))

        for (let item of payloads.rows) {
            item.category = await TarotCategory.find(item.category_id)
            tarots.push(item)
        }

        payloads.rows = tarots

        return response.json(payloads)
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
        let tarot = await Tarot.find(params.id)
        if (tarot == null) return response.notFound("Tarots")

        tarot.chapters = await tarot.chapters()
            .orderBy('index', 'asc')
            .fetch()

        tarot.cateogry = await TarotCategory.find(tarot.category_id)

        return response.success(tarot)
    }

    /**
     * create tarot
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const payloads = request.all()
        const category = await TarotCategory.find(payloads.category_id)
        if (category == null) return response.notFound("Tarot Category")

        payloads.image = await Uploader.tarot(request.file("image"))

        const tarot = await Tarot.create(payloads)
        tarot.category = category

        return response.success(tarot)
    }

    /**
     * update tarot
     *
     * @method update
     * @async
     *
     * @param request
     * @param response
     * @param params
     * @returns {Promise<void|*>}
     */
    async update({request, response, params}) {
        const index = request.input('index')

        const tarot = await Tarot.find(params.id);
        if (tarot == null) return response.notFound("Tarots")

        const payloads = request.all()
        const category = await TarotCategory.find(payloads.category_id)
        if (category == null) return response.notFound("Tarot Category")

        if (!isNaN(index)) {
            if (index > tarot.index) {
                const tarots = await Tarot.query()
                    .where('index', '<=', index)
                    .where('index', '>', tarot.index)
                    .fetch()
                await this.queue(tarots.toJSON(), -1)
            } else if (index < tarot.index) {
                const tarots = await Tarot.query()
                    .where('index', '>=', index)
                    .where('index', '<', tarot.index)
                    .fetch()
                await this.queue(tarots.toJSON(), 1)
            }
        }

        const image = await Uploader.tarot(request.file("image"))
        if (image != null) payloads.image = image

        tarot.merge(payloads);
        await tarot.save();

        tarot.category = category

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
        const tarot = await Tarot.find(params.id)
        if (tarot !== null) {
            await tarot.delete()
            const tarots = await Tarot.query()
                .where('index', '>', tarot.index)
                .fetch()
            await this.queue(tarots.toJSON(), -1)
        }
        return response.success(null)
    }
}

module.exports = TarotController
