'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ReferalSchema extends Schema {
    up() {
        this.create('user_referrals', (table) => {
            table.bigIncrements();

            table.integer("user_id");
            table.string("referral_code");

            table.timestamps()
        })
    }

    down() {
        this.drop('user_referrals')
    }
}

module.exports = ReferalSchema;
