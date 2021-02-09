'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BookSchema extends Schema {
    up() {
        this.create('tarots', (table) => {
            table.increments()

            table.integer('category_id')
            table.text("image")
            table.string('name')
            table.text('description')
            table.integer('index')

            table.timestamps()
        })
    }

    down() {
        this.drop('tarots')
    }
}

module.exports = BookSchema
