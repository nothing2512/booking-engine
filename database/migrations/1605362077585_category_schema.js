'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class CategorySchema extends Schema {
    up() {
        this.create(`categories`, (table) => {
            table.bigIncrements();
            table.string("name", 30);
            table.text('image');
            table.timestamps()
        })
    }

    down() {
        this.drop(`categories`)
    }
}

module.exports = CategorySchema;
