'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class NewsSchema extends Schema {
    up() {
        this.create('news', (table) => {
            table.bigIncrements();

            table.integer('author_id');
            table.string("author_type");

            table.text('content');
            table.string('title');
            table.string('slug');
            table.string('header_image');

            table.integer('category_id');

            table.timestamps()
        })
    }

    down() {
        this.drop('news')
    }
}

module.exports = NewsSchema;
