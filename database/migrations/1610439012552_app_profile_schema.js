'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class AppProfileSchema extends Schema {
    up() {
        this.create(`${Engine.lower("app")}_profiles`, (table) => {
            table.bigIncrements();

            table.integer("balance");

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.lower("app")}_profiles`)
    }
}

module.exports = AppProfileSchema;
