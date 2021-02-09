'use strict';

/** @type {import('App/Models/User')} */
const User = use('App/Models/User');

/**
 * Customizable Auth Middleware
 *
 * @class RequireAuth
 */
class RequireAuth {

    /**
     * handle data on middleware
     * converting user token to jwt token
     *
     * @method handle
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @param next
     * @returns {Promise<void|*>}
     */
    async handle({auth, request, response}, next) {
        const headers = request.headers();
        const access = headers.role_access;
        const authorization = headers.authorization;
        if (authorization == null || authorization == "" || authorization == undefined) return response.forbidden();

        if (!headers.unlock_access) {

            const user = await auth.getUser();
            let isAccessible;

            if (headers.super_admin_only && user.role_id == 1 && !(user instanceof User)) return next();

            if (user instanceof User) {
                if (user.role_id == 1) isAccessible = access.includes("user");
                else if (user.role_id == 2) isAccessible = access.includes("reader");
                else if (user.role_id == 3) isAccessible = access.includes("aggregator");
                else isAccessible = false
            } else {
                if (user.role_id == 1) isAccessible = true;
                else if (user.role_id == 2) isAccessible = true;
                else if (user.role_id == 3) isAccessible = access.includes("contentWriter");
                else isAccessible = false
            }

            if (!isAccessible) return response.forbidden()
        }

        return await next()
    }
}

module.exports = RequireAuth;
