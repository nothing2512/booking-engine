'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class VoucherSchema extends Schema {
    up() {
        this.create('vouchers', (table) => {
            table.bigIncrements();

            table.string("code");
            table.integer("payment_method");
            table.integer("type");
            table.string("title");
            table.text("description");
            table.text("image");
            table.integer("value");
            table.integer("max_discount");
            table.integer("max_redeem").defaultTo(1);
            table.datetime("valid_until");

            table.timestamps()
        })
    }

    down() {
        this.drop('vouchers')
    }
}

module.exports = VoucherSchema;
