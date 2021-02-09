'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LoginTokenSchema extends Schema {
    up() {
        this.create('login_tokens', (table) => {
            table.bigIncrements()
            table.integer("user_id")
            table.text('token')
            table.string("fcm")
			table.string("type")
            table.string("socket_id")
            table.timestamps()
        })
    }

    down() {
        this.drop('login_tokens')
    }
}

module.exports = LoginTokenSchema
