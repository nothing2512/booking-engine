'use strict';

/**
 * Role Content Writer Middleware
 *
 * @class RoleContentWriter
 */
class RoleContentWriter {

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
        headers.role_access.push("contentWriter");
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleContentWriter;
