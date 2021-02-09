'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LoginLogsSchema extends Schema {
    up() {
        this.create('activity_logs', (table) => {
            table.bigIncrements()

            table.integer('user_id')
            table.string('type')
            table.string("action")
            table.string('device')
            table.string('device_id')
            table.string('user_agent')
            table.string('latitude')
            table.string('longitude')

            table.timestamps()
        })
    }

    down() {
        this.drop('activity_logs')
    }
}

module.exports = LoginLogsSchema
