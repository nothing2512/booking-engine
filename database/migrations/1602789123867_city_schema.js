'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CitySchema extends Schema {
    up() {
        this.create('cities', (table) => {
            table.integer('id').primary()
            table.integer('province_id')
            table.string('name').notNullable()
        })
    }

    down() {
        this.drop('cities')
    }
}

module.exports = CitySchema
