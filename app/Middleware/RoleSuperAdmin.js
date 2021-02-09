'use strict';

/**
 * Role Super Admin Middleware
 *
 * @class RoleSuperAdmin
 */
class RoleSuperAdmin {

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
        headers.super_admin_only = true;
        request.headers(headers);

        return await next()
    }
}

module.exports = RoleSuperAdmin;
