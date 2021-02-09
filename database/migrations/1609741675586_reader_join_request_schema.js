'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReaderJoinRequestSchema extends Schema {
    up() {
        this.create('reader_join_requests', (table) => {
            table.bigIncrements()

            table.integer('reader_id')
            table.integer('aggregator_id')

            table.timestamps()
        })
    }

    down() {
        this.drop('reader_join_requests')
    }
}

module.exports = ReaderJoinRequestSchema
