'use strict'

/** @type {typeof import('../../Models/CostDistribution')} */
const CostDistribution = use('App/Models/CostDistribution')

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

class CostDistributionController {

    /**
     * get cost distribution detail
     *
     * @method detail
     * @async
     *
     * @param cost
     * @returns {Promise<*>}
     */
    async detail(cost) {
        const user = await User.find(cost.aggregator_id)
        user.aggregatorProfile = await user.aggregatorProfile().fetch()
        cost.user = user

        return cost
    }

    /**
     * get cost distribution lists
     *
     * @method index
     * @async
     *
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({response}) {
        const costs = await CostDistribution.all()
        const payloads = []

        for (let cost of costs.toJSON()) payloads.push(await this.detail(cost))

        return response.success(payloads)
    }

    /**
     * show detail cost distribution
     *
     * @method show
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({auth, params, response}) {
        const user = await auth.getUser()
        let cost = await CostDistribution.find(params.id)

        if (cost == null) return response.notFound("Cost Distribution")
        if (user instanceof User && cost.aggregator_id != user.id) return response.forbidden()

        return response.success(await this.detail(cost))
    }

    /**
     * update cost distribution by aggregator and admin only
     *
     * @method update
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({auth, request, response}) {
        const user = await auth.getUser()
        let cost = await CostDistribution.find(params.id)
        const payloads = request.all()

        if (cost == null) return response.notFound("Cost Distribution")

        if (payloads.aggregator + payloads.reader != 100) return response.error("Total cost aggregator and reader must be 100%")

        if (user instanceof User) {
            if (cost.aggregator_id != user.id) return response.forbidden()

            else cost.merge({
                aggregator: payloads.aggregator,
                reader: payloads.reader
            })
        } else cost.merge(request.all())

        await cost.save()

        return response.success(await this.detail(cost))
    }
}

module.exports = CostDistributionController
