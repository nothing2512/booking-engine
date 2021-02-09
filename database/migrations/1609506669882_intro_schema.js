'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IntroSchema extends Schema {
    up() {
        this.create('intros', (table) => {
            table.bigIncrements()

            table.integer('user_id')
            table.integer('path')
            table.date('date_of_birth')

            table.timestamps()
        })
    }

    down() {
        this.drop('intros')
    }
}

module.exports = IntroSchema
