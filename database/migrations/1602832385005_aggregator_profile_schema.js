'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class AggregatorProfileSchema extends Schema {
    up() {
        this.create(`${Engine.lower("aggregator")}_profiles`, (table) => {
            table.bigIncrements();
            table.bigInteger('user_id');

            table.string('name');
            table.text('address');
            table.string('logo');
            table.boolean('isCommunity').defaultTo(false);
            table.integer(`${Engine.lower("mentor")}_price`).defaultTo(10000);

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.lower("aggregator")}_profiles`)
    }
}

module.exports = AggregatorProfileSchema;
