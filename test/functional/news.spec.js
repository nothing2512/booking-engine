'use strict'

const { test, trait } = use('Test/Suite')('News')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

/** @type {typeof import('../../app/Models/News')} */
const News = use('App/Models/News')

/** @type {typeof import('../../app/Models/NewsCategory')} */
const NewsCategory = use('App/Models/NewsCategory')

trait('Test/ApiClient')
trait('Auth/Client')

test('Get All News', async ({ client, assert }) => {

    let news = await News.query().paginate()
    news = news.toJSON()

    const response = await client.get('api/news').end()

    response.assertStatus(200)
    response.assertJSON(news)

})

test("Store News", async ({ client, assert }) => {

    const category = await NewsCategory.create({ name: faker.word() })

    const response = await client.post('api/news')
        .field('content', faker.paragraph())
        .field('title', faker.sentence({ words: 5 }))
        .field('category_id', category.id)
        .attach('header_image', Helpers.tmpPath('madinah.jpg'))
        .loginVia({ id: 1 }, 'jwtAdmin')
        .end()

    response.assertStatus(201)

})

test("Get news by id", async ({ client, assert }) => {

    const newsId = 1
    let news = await News.find(newsId)
    let newsCategory = await news.category().fetch()
    newsCategory = newsCategory.toJSON()
    news = news.toJSON()
    news.category = newsCategory

    const response = await client.get(`api/news/${newsId}`).end()

    response.assertStatus(200)
    response.assertJSON(news)

})

test("Update news", async ({ client, assert }) => {

})

test("Delete news", async ({ client, assert }) => {

})

test("Get News Feed", async ({ client, assert }) => {

    

})