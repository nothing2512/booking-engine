'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class NotificationSchema extends Schema {
    up() {
        this.create('notifications', (table) => {
            table.increments();

            table.integer('user_id');
            table.integer('type');
            table.integer('parent_id');
            table.string('title');
            table.text('message');

            table.timestamps()
        })
    }

    down() {
        this.drop('notifications')
    }
}

module.exports = NotificationSchema;
