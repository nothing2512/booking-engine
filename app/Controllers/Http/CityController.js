'use strict';

/** @type {typeof import('../../Models/City')} */
const City = use('App/Models/City');

/** @type {typeof import('../../Models/District')} */
const District = use('App/Models/District');

/** @type {typeof import('../../Models/Province')} */
const Province = use('App/Models/Province');

/**
 * City Controller
 *
 * @class CityController
 */
class CityController {

    /**
     * show city detail
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const city = await City.find(params.id);
        if (city == null) return response.notFound("Kota");

        city.districts = await city.districts().fetch();
        city.province = await city.province().fetch();

        return response.success(city)
    }

    /**
     * create city
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const province = await Province.find(request.input('province_id'));
        if (province == null) return response.notFound("Provinsi");

        const city = await City.create(request.all());

        city.province = province;
        city.districts = await city.districts().fetch();

        return response.success(city)
    }

    /**
     * update city
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({params, request, response}) {
        const city = await City.find(params.id);
        if (city == null) return response.notFound("Kota");

        city.merge(request.all());
        await city.save();

        city.districts = await city.districts().fetch();
        city.province = await city.province().fetch();

        return response.success(city)
    }

    /**
     * delete city
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {

        await District.query()
            .where('city_id', params.id)
            .delete();

        await City.query()
            .where('id', params.id)
            .delete();

        return response.success(null)
    }
}

module.exports = CityController;
