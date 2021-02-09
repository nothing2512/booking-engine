'use strict'

const
    /** @type {import('../../Models/User')} */
    User = use('App/Models/User'),

    /** @type {import('../../Models/UserAttachment')} */
    UserAttachment = use('App/Models/UserAttachment'),

    /** @type {import('../../Models/AggregatorMentor')} */
    AggregatorReader = use('App/Models/AggregatorReader'),

    /** @type {typeof import('../../Helpers/Uploader')} */
    Uploader = use("App/Helpers/Uploader")

/**
 * User Attachment Controller
 *
 * @class UserAttachmentController
 */
class UserAttachmentController {

    /**
     * check if user has access or not
     *
     * @method hasAccess
     * @async
     *
     * @param user
     * @param attachment
     * @returns {Promise<boolean>}
     */
    async hasAccess(user, attachment) {
        if (!(user instanceof User)) return true
        if (user.role_id == 2 && user.id == attachment.user_id) return true
        if (user.role_id == 3) {
            if (user.id == attachment.user_id) return true
            else return (await AggregatorReader.query()
                .where('reader_id', attachment.user_id)
                .where('aggregator_id', user.id)
                .getCount()) > 0
        }
        return false
    }

    /**
     * add user attachment
     *
     * @method store
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({auth, request, response}) {
        const authUser = await auth.getUser()
        const fields = {
            ktp: await Uploader.user_attachment(request.file("ktp")),
            ijazah: await Uploader.user_attachment(request.file("ijazah")),
            license: await Uploader.user_attachment(request.file("license"))
        }

        let user;

        if (authUser instanceof User) user = authUser
        else user = await User.find(request.input("user_id"))

        let attachment = await user.attachment().fetch()
        if (attachment == null) attachment = await user.attachment().create(fields)
        else {
            attachment.fill(fields)
            await attachment.save()
        }

        return response.success(attachment)
    }

    /**
     * update user attachment
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({auth, params, request, response}) {
        const authUser = await auth.getUser()
        const attachment = await UserAttachment.find(params.id)
        if (attachment == null) return response.notFound("Attachment")

        if (!(await this.hasAccess(authUser, attachment))) return response.forbidden()

        attachment.ktp = await Uploader.user_attachment(request.file("ktp"))
        attachment.ijazah = await Uploader.user_attachment(request.file("ijazah"))
        attachment.license = await Uploader.user_attachment(request.file("license"))

        await request.multipart.process()
        await attachment.save()

        return response.success(attachment)
    }

    /**
     * delete user attachment
     *
     * @method destroy
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({auth, params, response}) {
        const authUser = await auth.getUser()
        const attachment = await UserAttachment.find(params.id)
        if (attachment == null) return response.notFound("Attachment")

        if (!(await this.hasAccess(authUser, attachment))) return response.forbidden()

        await attachment.delete()

        return response.success(null)
    }
}

module.exports = UserAttachmentController
