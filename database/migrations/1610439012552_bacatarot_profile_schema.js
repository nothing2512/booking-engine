'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NgajilagiProfileSchema extends Schema {
    up() {
        this.create('bacatarot_profiles', (table) => {
            table.bigIncrements()

            table.integer("balance")

            table.timestamps()
        })
    }

    down() {
        this.drop('bacatarot_profiles')
    }
}

module.exports = NgajilagiProfileSchema
