'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WebContentSchema extends Schema {
    up() {
        this.create('web_contents', (table) => {
            table.increments()
            table.string('name').unique().notNullable()
            table.string('slug').unique().notNullable()
            table.enum('type', ['html', 'json'], {useNative: true, enumName: 'content_type'})
            table.text('content')
            table.timestamps()
        })
    }

    down() {
        this.drop('web_contents')
    }
}

module.exports = WebContentSchema
