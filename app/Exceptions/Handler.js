'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
    /**
     * Handle exception thrown during the HTTP lifecycle
     *
     * @method handle
     *
     * @param  {Object} error
     * @param request
     * @param response
     *
     * @return {void}
     */
    async handle(error, {request, response}) {
        console.log(error)
        return response.json({
            status: false,
            message: error.message,
            data: null
        })
    }

    /**
     * Report exception for logging or debugging.
     *
     * @method report
     *
     * @param  {Object} error
     * @param request
     *
     * @return {void}
     */
    async report(error, {request}) {
    }
}

module.exports = ExceptionHandler
