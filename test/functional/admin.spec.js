'use strict'

const { test, trait } = use('Test/Suite')('Admin')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/Admin')} */
const Admin = use('App/Models/Admin')

trait('Test/ApiClient')
trait('Auth/Client')

test("Get All Admin", async ({ client, assert }) => {

    let admins = await Admin.all()
    admins = admins.toJSON()

    const response = await client.get(`api/admins`).end()


    response.assertStatus(200)
    assert.deepEqual(admins, response.body)

})

test("Get Admins Paginate", async ({ client, assert }) => {

    let page = 1
    let admins = await Admin.query().paginate(page)
    admins = admins.toJSON()

    const response1 = await client.get(`api/admins?page=${page}`).end()

    response1.assertStatus(200)
    assert.deepEqual(admins, response1.body)

    page++

    admins = await Admin.query().paginate(page)
    admins = admins.toJSON()

    const response2 = await client.get(`api/admins?page=${page}`).end()

    response2.assertStatus(200)
    assert.deepEqual(admins, response2.body)

})

test("Add admin", async ({ client, assert }) => {

    const admin = {
        username: faker.username(/** username length */ 8),
        email: faker.email(),
        password: "semuasama", // Hashed in Lucid Model Hook
        name: faker.name(),
    }

    const response = await client.post('api/admins').send(admin).end()

    response.assertStatus(201) // 201 Created

})

test("Get Admin by Id", async ({ client, assert }) => {

    const adminId = 1
    let admin = await Admin.find(adminId)
    admin = admin.toJSON()

    const response = await client.get(`api/admins/${adminId}`).end()

    response.assertStatus(200)
    assert.deepEqual(admin, response.body)

})

test("Update Admin", async ({ client, assert }) => {

    const adminId = 1

    let beforeUpdateAdmin = await Admin.find(adminId)
    beforeUpdateAdmin = beforeUpdateAdmin.toJSON()

    const fieldUpdate = {
        name: faker.name()
    }

    const response = await client.put(`api/admins/${adminId}`)
        .send(fieldUpdate)
        .loginVia({ id: adminId }, 'jwtAdmin')
        .end()

    response.assertStatus(200)
    assert.notEqual(beforeUpdateAdmin.name, response.body.name)

})

test("Delete admin", async ({ client, assert }) => {

    // Create then delete
    const newAdmin = await Admin.create({
        username: faker.username(),
        email: faker.email(),
        password: "semuasama",
        name: faker.name()
    })

    const response = await client.delete(`api/admins/${newAdmin.id}`).loginVia({ id: 1 }).end()

    const deletedAdmin = await Admin.find(newAdmin.id)

    response.assertStatus(200)
    assert.isNull(deletedAdmin)

})