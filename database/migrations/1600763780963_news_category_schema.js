'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class NewsCategorySchema extends Schema {
    up() {
        this.create('news_categories', (table) => {
            table.bigIncrements();
            table.string('name').notNullable();
            table.string('slug').notNullable();
            table.timestamps()
        })
    }

    down() {
        this.drop('news_categories')
    }
}

module.exports = NewsCategorySchema;
