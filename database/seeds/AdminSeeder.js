'use strict'

/*
|--------------------------------------------------------------------------
| AdminSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

/** @type {import('App/Models/Admin')} */
const Admin = use('App/Models/Admin')

class AdminSeeder {
  async run () {
      await Admin.create({
          username: "superman",
          email: "superman@bacatarot.com",
          password: "semuasama",
          name: "Superman",
          role_id: 1
      })
  }
}

module.exports = AdminSeeder
