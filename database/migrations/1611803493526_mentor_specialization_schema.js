'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class MentorSpecializationSchema extends Schema {
    up() {
        this.create(`${Engine.lower("mentor")}_specializations`, (table) => {
            table.bigIncrements();

            table.integer(Engine.id("mentor"));
            table.integer('category_id');

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.lower("mentor")}_specializations`)
    }
}

module.exports = MentorSpecializationSchema;
