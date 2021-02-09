'use strict';

/**
 * Role User Middleware
 *
 * @class RoleUser
 */
class RoleUser {

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
        headers.role_access.push("user");
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleUser;
