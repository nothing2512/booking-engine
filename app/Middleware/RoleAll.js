'use strict';

/**
 * All Role Middleware
 *
 * @class RoleAll
 */
class RoleAll {

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
        headers.unlock_access = true;
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleAll;
