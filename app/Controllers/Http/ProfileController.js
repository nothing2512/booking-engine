'use strict'

/**@type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/**@type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin')

/**@type {typeof import('../../Models/UserProfile')} */
const UserProfile = use('App/Models/UserProfile')

/**@type {typeof import('../../Models/AggregatorProfile')} */
const AggregatorProfile = use('App/Models/AggregatorProfile')

/** @type {typeof import('../../Models/AggregatorReader')} */
const AggregatorReader = use('App/Models/AggregatorReader')

/** @type {typeof import('../../Helpers/Uploader')} */
const Uploader = use('App/Helpers/Uploader')

/**
 * Profile Controller
 *
 * @class ProfileController
 */
class ProfileController {

    /**
     * Update Profile
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<{profile: *, message: string}>}
     */
    async update({auth, params, request, response}) {

        let authUser = await auth.getUser()
        let isAccessible = authUser instanceof Admin
        let payload = {}

        if (authUser instanceof User) {

            if (authUser.role_id == 3 && params.id != authUser.id) isAccessible = (await AggregatorReader.query()
                .where('aggregator_id', authUser.id)
                .where('reader_id', params.id)
                .getCount()) > 0
            else isAccessible = params.id == authUser.id
        }

        await Uploader.logo(request, "logo", url => payload.logo = url)
        await Uploader.logo(request, "profile_image", url => payload.profile_image = url)

        request.multipart.field((key, value) => {
            payload[key] = value
        })

        if (!isAccessible) return response.forbidden()

            const user = await User.find(params.id)
            await user.load('role')

            const profile = user.role_id == 3
                ? await AggregatorProfile.findBy('user_id', params.id)
                : await UserProfile.findBy('user_id', params.id)

            profile.merge(request.all())

            await profile.save()

            return response.success(profile)

    }

}

module.exports = ProfileController
