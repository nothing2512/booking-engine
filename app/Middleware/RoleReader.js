'use strict';

/**
 * Role Counselor Middleware
 *
 * @class RoleReader
 */
class RoleReader {

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
        headers.role_access.push("reader");
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleReader;
