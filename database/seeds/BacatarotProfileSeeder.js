'use strict'

/*
|--------------------------------------------------------------------------
| BacatarotProfileSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

/**@type {typeof import('App/Models/BacatarotProfile')} */
const BacatarotProfile = use('App/Models/BacatarotProfile')

class BacatarotProfileSeeder {
    async run () {
        await BacatarotProfile.create({
            balance: 0
        })
    }
}

module.exports = BacatarotProfileSeeder
