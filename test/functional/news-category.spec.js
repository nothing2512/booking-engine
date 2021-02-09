'use strict'

const { test, trait } = use('Test/Suite')('News Category')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/NewsCategory')} */
const NewsCategory = use('App/Models/NewsCategory')

trait('Test/ApiClient')
trait('Auth/Client')

test("Get all category", async ({ client, assert }) => {

    let categories = await NewsCategory.all()
    categories = categories.toJSON()

    const response = await client.get('/api/news_category').end()

    response.assertStatus(200)
    response.assertJSON(categories)

})

test("Add a category", async ({ client, assert }) => {

    const category = { name: faker.word() }

    const response = await client.post('api/news_category').send(category).end()

    response.assertStatus(201)

})

test("Get category by id", async ({ client, assert }) => {

    const categoryId = 1
    let category = await NewsCategory.find(categoryId)
    category = category.toJSON()

    const response = await client.get(`api/news_category/${categoryId}`).end()

    response.assertStatus(200)
    response.assertJSON(category)

})

test("Update category", async ({ client, assert }) => {

    const categoryId = 1

    let beforeUpdateCategory = await NewsCategory.find(categoryId)
    beforeUpdateCategory = beforeUpdateCategory.toJSON()

    const fieldUpdate = { name: faker.word() }

    const response = await client.put(`api/news_category/${categoryId}`).send(fieldUpdate).end()

    response.assertStatus(200)
    assert.notEqual(beforeUpdateCategory.name, response.body.name)

})

test("Delete category", async ({ client, assert }) => {

    // Create then delete
    const newCategory = await NewsCategory.create({ name: faker.word() })

    const response = await client.delete(`api/news_category/${newCategory.id}`).end()

    const deletedCategory = await NewsCategory.find(newCategory.id)

    response.assertStatus(200)
    assert.isNull(deletedCategory)

})