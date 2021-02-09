'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProvinceSchema extends Schema {
    up() {
        this.create('provinces', (table) => {
            table.integer('id').primary()
            table.string('name').notNullable()
        })
    }

    down() {
        this.drop('provinces')
    }
}

module.exports = ProvinceSchema
