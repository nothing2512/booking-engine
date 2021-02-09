'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AggregatorProfileSchema extends Schema {
    up() {
        this.create('aggregator_profiles', (table) => {
            table.bigIncrements()
            table.bigInteger('user_id').notNullable()

            table.string('name').notNullable()
            table.text('address').notNullable()
            table.string('logo')
            table.boolean('isCommunity').notNullable().defaultTo(false)
            table.integer('reader_price').defaultTo(10000)

            table.timestamps()
        })
    }

    down() {
        this.drop('aggregator_profiles')
    }
}

module.exports = AggregatorProfileSchema
