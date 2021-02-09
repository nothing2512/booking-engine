'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PaymentSchema extends Schema {
    up() {
        this.create('payments', (table) => {
            table.bigIncrements();

            table.integer('consultation_id');
            table.string('midtrans_transaction_id');
            table.integer('method');
            table.integer('price');
            table.string('va_number');
            table.string('qr_link');
            table.string('redirect_link');
            table.string('bill_key');
            table.string('bill_code');

            table.timestamps()
        })
    }

    down() {
        this.drop('payments')
    }
}

module.exports = PaymentSchema;
