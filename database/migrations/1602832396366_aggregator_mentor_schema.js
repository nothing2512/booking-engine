'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class AggregatorMentorSchema extends Schema {
    up() {
        this.create(`${Engine.lower("aggregator")}_${Engine.lower("mentor")}s`, (table) => {
            table.bigIncrements();
            table.bigInteger(`${Engine.id("mentor")}`);
            table.bigInteger(`${Engine.id("aggregator")}`)
        })
    }

    down() {
        this.drop('${Engine.lower("aggregator")}_${Engine.lower("mentor")}s')
    }
}

module.exports = AggregatorMentorSchema;
