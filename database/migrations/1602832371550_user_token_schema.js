'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserTokenSchema extends Schema {
    up() {
        this.create('user_tokens', (table) => {
            table.bigIncrements();
            table.integer('user_id');
            table.string('token', 255).unique().index();
            table.string('type', 80);
            table.boolean('is_revoked').defaultTo(false);
            table.timestamps()
        })
    }

    down() {
        this.drop('user_tokens')
    }
}

module.exports = UserTokenSchema;
