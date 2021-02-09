'use strict';

/**
 * Converting empty string from given data to null
 *
 * @class ConvertEmptyStringsToNull
 */
class ConvertEmptyStringsToNull {

    /**
     * handle requests
     *
     * @async
     * @method handle
     *
     * @param request
     * @param response
     * @param next
     * @return {Promise<void|*>}
     */
    async handle({request, response}, next) {

        /**
         * Converting Query String
         */
        if (Object.keys(request.qs).length) {
            request.qs = Object.assign(
                ...Object.keys(request.qs).map(key => ({
                    [key]: request.qs[key] !== '' ? request.qs[key] : null
                }))
            )
        }

        /**
         * Converting Request Body
         */
        if (Object.keys(request.body).length) {
            request.body = Object.assign(
                ...Object.keys(request.body).map(key => ({
                    [key]: request.body[key] !== '' ? request.body[key] : null
                }))
            )
        }

        await next()
    }
}

module.exports = ConvertEmptyStringsToNull;
