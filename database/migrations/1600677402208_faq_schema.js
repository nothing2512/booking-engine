'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FaqSchema extends Schema {
    up() {
        this.create('faqs', (table) => {
            table.bigIncrements()
            table.text("question").notNullable()
            table.text('answer').notNullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('faqs')
    }
}

module.exports = FaqSchema
