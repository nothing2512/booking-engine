'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WelcomingSchema extends Schema {
    up() {
        this.create('welcomings', (table) => {
            table.bigIncrements()

            table.string("title")
            table.string("description")
            table.string("image")
            table.enum('type', ["user", "reader"], {
                useNative: true,
                enumName: "welcoming_type_enum"
            })

            table.timestamps()
        })
    }

    down() {
        this.drop('welcomings')
    }
}

module.exports = WelcomingSchema
