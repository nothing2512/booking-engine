'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class CostDistributionSchema extends Schema {
    up() {
        this.create('cost_distributions', (table) => {
            table.bigIncrements();

            table.integer(Engine.id("aggregator"));
            table.integer(Engine.lower("app")).defaultTo(20);
            table.integer(Engine.lower("aggregator")).defaultTo(20);
            table.integer(Engine.lower("mentor")).defaultTo(80);

            table.timestamps()
        })
    }

    down() {
        this.drop('cost_distributions')
    }
}

module.exports = CostDistributionSchema;
