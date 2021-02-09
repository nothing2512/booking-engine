'use strict';

/**
 * Only Aggregator Middleware
 *
 * @class RoleAggregator
 */
class RoleAggregator {

    /**
     * adding role access
     *
     * @method handle
     * @async
     *
     * @param request
     * @param response
     * @param next
     * @returns {Promise<void|*>}
     */
    async handle({request, response}, next) {

        const headers = request.headers();
        headers.role_access.push("aggregator");
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleAggregator;
