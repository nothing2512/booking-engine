'use strict';

/**@type {typeof import('../../Models/Testimonial')} */
const Testimonial = use('App/Models/Testimonial');

/**@type {typeof import('../../Helpers/Uploader')} */
const Uploader = use('App/Helpers/Uploader');

/**
 * Testimonial Controller
 *
 * @class TestimonialController
 */
class TestimonialController {

    /**
     * show testimonial list
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        const page = request.input('page');

        return response.json(Object.assign({
            status: true,
            message: ""
        }, await Testimonial.query().paginate(page)))
    }

    /**
     * create testimonial
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const payload = {};

        await Uploader.testimony(request, "picture", (url) => payload.picture_name = url);

        request.multipart.field(async (name, value) => {
            if (["reviewer_name", "testi"].includes(name)) payload[name] = value
        });

        await request.multipart.process();

        return response.success(await Testimonial.create(payload))
    }

    /**
     * show testimonial detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const testimonial = await Testimonial.find(params.id);
        if (testimonial == null) return response.notFound("Testimonial");

        return response.success(testimonial)
    }

    /**
     * update testimonial
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
        const testimonial = await Testimonial.find(params.id);
        if (testimonial == null) return response.notFound("Testimonial");

        await Uploader.testimony(request, "picture", (url) => testimonial.picture_name = url);

        request.multipart.field(async (name, value) => {
            if (["reviewer_name", "testi"].includes(name)) testimonial[name] = value
        });

        await request.multipart.process();
        await testimonial.save();

        return response.success(testimonial)
    }

    /**
     * delete testimonial
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        await Testimonial.query().where('id', params.id).delete();
        return response.success(null)
    }

}

module.exports = TestimonialController;
