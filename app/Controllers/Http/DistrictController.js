'use strict';

/** @type {typeof import('../../Models/District')} */
const District = use('App/Models/District');

/** @type {typeof import('../../Models/Province')} */
const Province = use('App/Models/Province');

/** @type {typeof import('../../Models/City')} */
const City = use('App/Models/City');

/**
 * District Controller
 *
 * @class DistrictController
 */
class DistrictController {

    /**
     * show district detail
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const district = await District.find(params.id);
        if (district == null) return response.notFound("District");

        const city = await district.city().fetch();
        district.city = city;
        district.province = await Province.query().where('id', city.province_id).first();

        return response.success(district)
    }

    /**
     * create district
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const city = await City.find(request.input('city_id'));
        if (city == null) return response.notFound("City");

        const district = await District.create(request.all());

        district.city = city;
        district.province = await Province.query().where('id', city.province_id).first();

        return response.success(district)
    }

    /**
     * update district
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({params, request, response}) {
        const district = await District.find(params.id);
        if (district == null) return response.notFound("District");

        district.merge(request.all());
        await district.save();

        const city = await district.city().fetch();
        district.city = city;
        district.province = await Province.query().where('id', city.province_id).first();

        return response.success(district)
    }

    /**
     * delete district
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {

        await District.query()
            .where('id', params.id)
            .delete();

        return response.success(null)
    }
}

module.exports = DistrictController;
