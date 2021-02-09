'use strict'

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../Models/UserReferral')} */
const Referral = use('App/Models/UserReferral')

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

class ReferralController {

    async generate() {
        const users = await User.all()
        for (let user of users.toJSON()) {
            await Referral.createFromUser(user)
        }
        return "Ok"
    }

    async show({params, auth, response}) {
        const referral = await Referral.findBy("referral_code", params.code)
        if (referral == null) return response.notFound("Referral")

        try {
            const user = await auth.getUser()
            if (user.id != referral.user_id) referral.user = []
            else referral.user = await User.query()
                .whereIn("id", Database.from("user_referral_inviteds").where("referral_id", referral.id).select("user_id"))
                .fetch()
        } catch (e) {
            referral.user = []
        }

        return response.success(referral)
    }
}

module.exports = ReferralController
