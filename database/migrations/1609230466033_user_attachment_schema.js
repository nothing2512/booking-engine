'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserAttachmentSchema extends Schema {
    up() {
        this.create('user_attachments', (table) => {
            table.bigIncrements();

            table.integer('user_id');
            table.text('ktp');
            table.text('ijazah');
            table.text('license');

            table.timestamps()
        })
    }

    down() {
        this.drop('user_attachments')
    }
}

module.exports = UserAttachmentSchema;
