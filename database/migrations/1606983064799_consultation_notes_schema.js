'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConsultationNotesSchema extends Schema {
    up() {
        this.create('consultation_notes', (table) => {
            table.increments()

            table.integer('consultation_id')
            table.integer('tarot_id')
            table.string('title')
            table.text('notes')

            table.timestamps()
        })
    }

    down() {
        this.drop('consultation_notes')
    }
}

module.exports = ConsultationNotesSchema
