'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/**@type {typeof import('App/Models/RoleAdmin')} */
const RoleAdmin = use('App/Models/RoleAdmin');

/**@type {typeof import('App/Models/Role')} */
const Role = use('App/Models/Role');

/**@type {typeof import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

class RoleSeeder {
    async run() {
        await RoleAdmin.createMany([
            {
                name: "Super Admin",
                slug: "superadmin",
                description: "superadmin"
            },
            {
                name: "Operational Admin",
                slug: "admin",
                description: "admin"
            },
            {
                name: "Content Writer",
                slug: "writer",
                description: "content writer"
            }
        ]);

        await Role.create([
            {
                name: Engine.title("user"),
                slug: Engine.lower("user"),
                description: Engine.lower("user")
            },
            {
                name: Engine.title("mentor"),
                slug: Engine.lower("mentor"),
                description: Engine.lower("mentor")
            },
            {
                name: Engine.title("aggregator"),
                slug: Engine.lower("aggregator"),
                description: Engine.lower("aggregator")
            }
        ])
    }
}

module.exports = RoleSeeder;
