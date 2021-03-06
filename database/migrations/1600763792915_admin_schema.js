'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AdminSchema extends Schema {
    up() {
        this.create('admins', (table) => {
            table.bigIncrements();
            table.string('username', 80).unique();
            table.string('email', 254).unique();
            table.string('password', 60);
            table.string('name', 100);
            table.integer("role_id");
            table.timestamps()
        })
    }

    down() {
        this.drop('admins')
    }
}

module.exports = AdminSchema;
