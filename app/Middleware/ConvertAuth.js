'use strict';

/** @type {import('App/Helpers/Tokenizer')} */
const Tokenizer = use('App/Helpers/Tokenizer');

/** @type {import('App/Helpers/Logger')} */
const Logger = use('App/Helpers/Logger');

/**
 * Auth Converter
 * From given token to jwt token
 *
 * @class ConvertAuth
 */
class ConvertAuth {

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
        const result = (status, message, data = null) => {
            return response.json({
                status: status,
                message: message,
                data: data
            })
        };

        response.underDevelopment = () => result(false, "Sedang dalam pengembangan");
        response.error = (message) => result(false, message);
        response.success = (data) => result(true, "", data);
        response.forbidden = () => result(false, "Akses ditolak !");
        response.missmatch = () => result(false, "Token salah !");
        response.notFound = (name) => result(false, `${name} tidak ditemukan`);

        const logPayload = request.only(["device", "device_id", 'user_agent', 'latitude', 'longitude']);
        const headers = request.headers();
        const urlAction = request.method().toLowerCase() + ":" + decodeURI(request.url());
        const data = JSON.stringify(request.all());

        headers.role_access = [];
        headers.unlock_access = false;
        headers.super_admin_only = false;
        request.headers(headers);

        const payloads = request.all()
        if (payloads.email != null) {
            payloads.email = payloads.email.toLowerCase()
            request.body = payloads
        }

        const authorization = headers.authorization;
        if (authorization == null || authorization == "" || authorization == undefined) {
            await Logger.log(null, urlAction, logPayload, data);
            return next();
        }

        const token = await Tokenizer.retrieve(authorization.split(" ")[1]);
        if (token == null) return response.missmatch();

        headers.originalAuthorization = headers.authorization.replace("Bearer ", "");
        headers.authorization = 'Bearer ' + token.token;

        auth.authenticatorInstance = auth.authenticator(token.authenticator);

        const user = await auth.getUser();
        await Logger.log(user, urlAction, logPayload, data);

        return await next()
    }
}

module.exports = ConvertAuth;
