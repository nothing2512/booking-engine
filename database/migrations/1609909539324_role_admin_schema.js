'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class RoleAdminSchema extends Schema {
    up() {
        this.create('role_admins', (table) => {
            table.bigIncrements();

            table.string('name');
            table.string('slug');
            table.text("description");

            table.timestamps()
        })
    }

    down() {
        this.drop('role_admins')
    }
}

module.exports = RoleAdminSchema;
