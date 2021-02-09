'use strict';

const
    /**@type {typeof import('../../Models/Category')} */
    Category = use('App/Models/Category'),

    /** @type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader');

/**
 * Category Controller
 *
 * @class BookCategoryController
 */
class BookCategoryController {

    /**
     * get category list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        let page = request.input('page');
        if (isNaN(page)) page = 1;

        return response.json(Object.assign({
            status: true,
            message: ""
        }, await Category.query().paginate(page)))
    }

    /**
     * create / insert category
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const payload = request.all();
        payload.image = await Uploader.category(request.file("image"));
        const category = await Category.create(payload);
        return response.success(category)
    }

    /**
     * show category detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        let category = await Category.find(params.id);
        if (category == null) return response.notFound("Category");
        return response.success(category)
    }

    /**
     * update category
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
        const category = await Category.find(params.id);
        if (category == null) return response.notFound("Category");

        category.merge(request.all());
        const image = Uploader.category(request.file("image"));
        if (image != null) category.image = image;

        await category.save();
        return response.success(category)
    }

    /**
     * delete category
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        const category = await Category.find(params.id);
        if (category !== null) await category.delete();
        return response.success(null)
    }
}

module.exports = BookCategoryController;
