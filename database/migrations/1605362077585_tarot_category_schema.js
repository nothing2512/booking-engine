'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TarotCategorySchema extends Schema {
    up() {
        this.create('tarot_categories', (table) => {
            table.bigIncrements();
            table.string("name", 30);
            table.text('image')
            table.timestamps()
        })
    }

    down() {
        this.drop('tarot_categories')
    }
}

module.exports = TarotCategorySchema;
