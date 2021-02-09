'use strict'

const { test, trait } = use('Test/Suite')('User')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/User')} */
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')

test("Get All user", async ({ client, assert }) => {

    let users = await User.all()
    users = users.toJSON()

    const response = await client.get('api/users').end()

    response.assertStatus(200)
    response.assertJSON(users)

})

test('Register User', async ({ client, assert }) => {

    const user = {
        username: faker.username(/** username length */ 8),
        email: faker.email({ domain: 'ngajilagi.com' }),
        password: "semuasama", // Hashed in Lucid Model Hook
        name: faker.name(),
        phone: faker.phone({ formatted: false }),
        role_id: 1 // As user
    }

    const response = await client.post('api/users').send(user).end()

    response.assertStatus(201) // 201 Created

})

test('Add ustad as aggregator', async ({ client, assert }) => {

    const aggregator = await User.findBy('role_id', 3)
    const newUstad = {
        name: faker.name(),
        phone: faker.phone(),
        email: faker.email({ domain: "ngajilagi.com" })
    }

    const response = await client.post('api/registration')
        .send(newUstad)
        .loginVia({ id: aggregator.id }, 'jwt')
        .end()

    response.assertStatus(201)

})

test("Get User by Id", async ({ client, assert }) => {

    const userId = 1
    let user = await User.find(userId)

    await user.load('role')

    const role = user.getRelated('role')
    if (role.name.includes('Aggregator'))
        await user.load('aggregatorProfile')
    else
        await user.load('profile')

    user = user.toJSON()

    const response = await client.get(`api/users/${userId}`).end()

    response.assertStatus(200)
    response.assertJSON(user)

})

test("Update User", async ({ client, assert }) => {

    const userId = 2

    let beforeUpdateUser = await User.find(userId)
    beforeUpdateUser = beforeUpdateUser.toJSON()

    const fieldUpdate = {
        username: faker.username()
    }

    const response = await client.put(`api/users/${userId}`).send(fieldUpdate).loginVia({ id: userId }, 'jwt').end()

    response.assertStatus(200)
    assert.notEqual(beforeUpdateUser.username, response.body.username)

})

test("Delete User", async ({ client, assert }) => {

    // Create then delete
    const newUser = await User.create({
        username: faker.username(/** username length */ 8),
        email: faker.email({ domain: 'ngajilagi.com' }),
        password: "semuasama", // Hashed in Lucid Model Hook
        role_id: 1 // As user
    })

    const response = await client.delete(`api/users/${newUser.id}`).end()

    const deletedUser = await User.find(newUser.id)

    response.assertStatus(200)
    assert.isNull(deletedUser)

})