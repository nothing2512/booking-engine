'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ConsultationVoucherSchema extends Schema {
    up() {
        this.create('consultation_vouchers', (table) => {
            table.bigIncrements();

            table.integer("consultation_id");
            table.string("voucher_code");
            table.integer("payment_method");
            table.integer("type");
            table.string("title");
            table.text("description");
            table.text("image");
            table.integer("value");
            table.integer("max_discount");
            table.integer("original_price");
            table.integer("price");

            table.timestamps()
        })
    }

    down() {
        this.drop('consultation_vouchers')
    }
}

module.exports = ConsultationVoucherSchema;
