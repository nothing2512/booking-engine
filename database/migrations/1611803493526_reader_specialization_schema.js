'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReaderSpecializationSchema extends Schema {
    up() {
        this.create('reader_specializations', (table) => {
            table.bigIncrements()

            table.integer("reader_id")
            table.integer("category_id")

            table.timestamps()
        })
    }

    down() {
        this.drop('reader_specializations')
    }
}

module.exports = ReaderSpecializationSchema
