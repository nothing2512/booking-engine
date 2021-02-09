'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AggregatorReaderSchema extends Schema {
    up() {
        this.create('aggregator_readers', (table) => {
            table.bigIncrements()
            table.bigInteger('reader_id').notNullable()
            table.bigInteger('aggregator_id').notNullable()
        })
    }

    down() {
        this.drop('aggregator_readers')
    }
}

module.exports = AggregatorReaderSchema
