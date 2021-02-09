'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AdminTokenSchema extends Schema {
    up() {
        this.create('admin_tokens', (table) => {
            table.increments();
            table.integer('admin_id');
            table.string('token', 255).unique().index();
            table.string('type', 80);
            table.boolean('is_revoked').defaultTo(false);
            table.timestamps()
        })
    }

    down() {
        this.drop('admin_tokens')
    }
}

module.exports = AdminTokenSchema;
