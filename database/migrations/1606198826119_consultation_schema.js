'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class ConsultationSchema extends Schema {
    up() {
        this.create('consultations', (table) => {
            table.bigIncrements();

            table.integer(`${Engine.id("mentor")}`);
            table.integer('user_id');
            table.integer('category_id');
            table.integer('price');
            table.date('date');
            table.time('time');
            table.integer('status');
            table.text('meet_url');
            table.integer('approval_status').defaultTo(0);
            table.string("voucher_code");

            table.timestamps()
        })
    }

    down() {
        this.drop('consultations')
    }
}

module.exports = ConsultationSchema;
