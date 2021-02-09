'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class MentorScheduleSchema extends Schema {
    up() {
        this.create(`${Engine.lower("mentor")}_schedules`, (table) => {
            table.bigIncrements();

            table.integer(`${Engine.id("mentor")}`);
            table.time("start_time");
            table.time("end_time");
            table.integer("day");

            table.timestamps()
        })
    }

    down() {
        this.drop(`${Engine.lower("mentor")}_schedules`)
    }
}

module.exports = MentorScheduleSchema;
