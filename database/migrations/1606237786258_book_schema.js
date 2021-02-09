'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class BookSchema extends Schema {
    up() {
        this.create(`${Engine.get("book")}s`, (table) => {
            table.increments();

            table.integer('category_id');
            table.text("image");
            table.string('name');
            table.text('description');
            table.integer('index');

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.get("book")}s`)
    }
}

module.exports = BookSchema;
