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

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

/**@type {typeof import('App/Models/RoleAdmin')} */
const RoleAdmin = use('App/Models/RoleAdmin')

const Database = use('Database')

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
        ])

        await Database.table("roles").insert([
            {
                name: "User",
                slug: "user",
                description: "user"
            },
            {
                name: "Reader",
                slug: "reader",
                description: "reader"
            },
            {
                name: "Aggregator",
                slug: "aggregator",
                description: "aggregator"
            }
        ])
    }
}

module.exports = RoleSeeder
