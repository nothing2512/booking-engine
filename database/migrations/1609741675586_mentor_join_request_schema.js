'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('Engine');

class EngineJoinRequestSchema extends Schema {
    up() {
        this.create(`${Engine.lower("mentor")}_join_requests`, (table) => {
            table.bigIncrements();

            table.integer(Engine.id("mentor"));
            table.integer(Engine.id("aggregator"));

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.lower("mentor")}_join_requests`)
    }
}

module.exports = EngineJoinRequestSchema;
