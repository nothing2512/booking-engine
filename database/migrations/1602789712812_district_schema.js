'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DistrictSchema extends Schema {
    up() {
        this.create('districts', (table) => {
            table.integer('id').primary()
            table.integer('city_id')
            table.string('name').notNullable()
        })
    }

    down() {
        this.drop('districts')
    }
}

module.exports = DistrictSchema
