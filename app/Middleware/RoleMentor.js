'use strict';

/**
 * Role Mentor Middleware
 *
 * @class RoleMentor
 */
class RoleMentor {

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
        headers.role_access.push("mentor");
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleMentor;
