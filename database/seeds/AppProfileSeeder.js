'use strict'

/*
|--------------------------------------------------------------------------
| AppProfileSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/**@type {typeof import('app/Models/AppProfile')} */
const AppProfile = use('App/Models/AppProfile');

class AppProfileSeeder {
    async run () {
        await AppProfile.create({
            balance: 0
        })
    }
}

module.exports = AppProfileSeeder;
