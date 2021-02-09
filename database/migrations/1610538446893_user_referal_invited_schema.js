'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserReferalInvitedSchema extends Schema {
    up() {
        this.create('user_referral_inviteds', (table) => {
            table.bigIncrements()

            table.integer("referral_id")
            table.integer("user_id")

            table.timestamps()
        })
    }

    down() {
        this.drop('user_referal_inviteds')
    }
}

module.exports = UserReferalInvitedSchema
