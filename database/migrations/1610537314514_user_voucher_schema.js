'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserVoucherSchema extends Schema {
    up() {
        this.create('user_vouchers', (table) => {
            table.increments();

            table.integer("user_id");
            table.string("voucher_code");
            table.integer("payment_method");
            table.integer("type");
            table.string("title");
            table.text("description");
            table.text("image");
            table.integer("value");
            table.integer("max_discount");
            table.datetime("valid_until");
            table.boolean("used").default(false);

            table.timestamps()
        })
    }

    down() {
        this.drop('user_vouchers')
    }
}

module.exports = UserVoucherSchema;
