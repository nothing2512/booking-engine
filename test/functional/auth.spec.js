'use strict'

const { test, trait } = use('Test/Suite')('Auth')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/User')} */
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')


test('Login as user and get token', async ({ client, assert }) => {

  // NOTE: Dependent to DefaultUserSeeder
  const user = {
    email: "john@doe.com",
    password: "semuasama"
  }

  const response = await client.post('api/signin').send(user).end()

  response.assertStatus(200)
  assert.hasAllKeys(response.body, ['type', 'token', 'refreshToken', 'user'])

})

test('Ensure not logged in if user does not exist', async ({ client, assert }) => {

  const user = {
    username: "anjay@mail.com",
    password: "semuasama"
  }

  const response = await client.post('api/signin').send(user).end()

  response.assertStatus(401)

})


test('Login as Admin and get token', async ({ client, assert }) => {

  // NOTE: Dependent to DefaultUserSeeder
  const user = {
    username: "ngadmins",
    password: "semuasama"
  }

  const response = await client.post('api/admin/signin').send(user).end()

  response.assertStatus(200)
  assert.hasAllKeys(response.body, ['type', 'token', 'refreshToken', 'user'])

})

test('User sign out and revoke refresh tokens', async ({ client }) => {

  // NOTE: Dependent to DefaultUserSeeder
  const user = {
    id: 1,
    email: "john@doe.com",
    password: "semuasama"
  }

  const response = await client.get("api/signout").loginVia(user, 'jwt').end()

  response.assertStatus(200)

})

test('Admin sign out and revoke refresh tokens', async ({ client }) => {

  // NOTE: Dependent to DefaultUserSeeder
  const user = {
    id: 1,
    email: "admin@ngajilagi.co",
    password: "semuasama"
  }

  const response = await client.get("api/admin/signout").loginVia(user, 'jwtAdmin').end()

  response.assertStatus(200)

})

