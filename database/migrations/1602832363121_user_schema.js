'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
    up() {
        this.create('users', (table) => {
            table.bigIncrements();

            table.string('username', 80).unique();
            table.string('email', 254).unique();
            table.string('password', 60);
            table.enum('status', ['active', 'inactive', 'banned'], {
                useNative: true,
                enumName: 'user_status'
            }).defaultTo('active');
            table.integer('role_id');
            table.boolean("is_approved");

            table.timestamp('registered_at').defaultTo(this.fn.now());
            table.timestamp('updated_at')
        })
    }

    down() {
        this.drop('users')
    }
}

module.exports = UserSchema;
