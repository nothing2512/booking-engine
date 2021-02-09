'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReaderScheduleSchema extends Schema {
    up() {
        this.create('reader_schedules', (table) => {
            table.bigIncrements()

            table.integer("reader_id")
            table.time("start_time")
            table.time("end_time")
            table.integer("day")

            table.timestamps()
        })
    }

    down() {
        this.drop('reader_schedules')
    }
}

module.exports = ReaderScheduleSchema
