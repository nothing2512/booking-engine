'use strict';

/** @type {typeof import('../../Models/Province')} */
const Province = use('App/Models/Province');

/** @type {typeof import('../../Models/City')} */
const City = use('App/Models/City');

/** @type {typeof import('../../Models/District')} */
const District = use('App/Models/District');

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/**
 * Province Controller
 *
 * @class ProvinceController
 */
class ProvinceController {

    /**
     * get province list
     *
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({response}) {
        return response.success(await Province.all())
    }

    /**
     * show province detail
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const province = await Province.find(params.id);
        if (province == null) return response.notFound("Provinsi");
        province.cities = await province.cities().fetch();
        return response.success(province)
    }

    /**
     * create province
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const province = await Province.create(request.all());
        province.cities = await province.cities().fetch();
        return response.success(province)
    }

    /**
     * update province
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({params, request, response}) {
        const province = await Province.find(params.id);
        if (province == null) return response.notFound("Provinsi");

        province.merge(request.all());
        await province.save();
        province.cities = await province.cities().fetch();

        return response.success(province)
    }

    /**
     * delete province
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {

        await District.query().whereIn('city_id', Database.from('cities').where('province_id', params.id).select('id')).delete();
        await City.query().where('province_id', params.id).delete();
        await Province.query().where('id', params.id).delete();
        return response.success(null)
    }
}

module.exports = ProvinceController;
