'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ConsultationChatSchema extends Schema {
    up() {
        this.create('consultation_chats', (table) => {
            table.bigIncrements();

            table.integer("consultation_id");
            table.integer("user_id");
            table.text("text");
            table.text("attachment");

            table.timestamps()
        })
    }

    down() {
        this.drop('consultation_chats')
    }
}

module.exports = ConsultationChatSchema;
