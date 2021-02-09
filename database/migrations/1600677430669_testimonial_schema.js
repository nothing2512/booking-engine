'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TestimonialSchema extends Schema {
    up() {
        this.create('testimonials', (table) => {
            table.increments();
            table.string('reviewer_name').notNullable();
            table.text('testi').notNullable();
            table.string('picture_name');
            table.timestamps()
        })
    }

    down() {
        this.drop('testimonials')
    }
}

module.exports = TestimonialSchema;
