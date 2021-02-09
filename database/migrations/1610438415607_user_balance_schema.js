'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserBalanceSchema extends Schema {
    up() {
        this.create('user_balances', (table) => {
            table.bigIncrements();

            table.integer("user_id");
            table.integer("balance");

            table.timestamps()
        })
    }

    down() {
        this.drop('user_balances')
    }
}

module.exports = UserBalanceSchema;
