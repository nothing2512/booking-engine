'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserProfileSchema extends Schema {
    up() {
        this.create('user_profiles', (table) => {
            table.bigIncrements()
            table.bigInteger('user_id').notNullable()

            table.string('name').notNullable()
            table.date('date_of_birth')
            table.string('place_of_birth')
            table.string('education')
            table.string('occupation')
            table.string('marriage_status')
            table.string('phone_number')
            table.string('profile_image')
            table.text('address')
            table.json('location')

            table.integer('district_id')
            table.integer('city_id')
            table.integer('province_id')

            table.timestamps()
        })
    }

    down() {
        this.drop('user_profiles')
    }
}

module.exports = UserProfileSchema

