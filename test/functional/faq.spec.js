'use strict'

const { test, trait } = use('Test/Suite')('Faq')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/Faq')} */
const Faq = use('App/Models/Faq')

trait('Test/ApiClient')
trait('Auth/Client')

test("Get all Faqs", async ({ client, assert }) => {

    let faqs = await Faq.all()
    faqs = faqs.toJSON()

    const response = await client.get('/api/faqs').end()

    response.assertStatus(200)
    response.assertJSON(faqs)

})

test("Add a faq", async ({ client, assert }) => {

    const faq = {
        question: faker.sentence(),
        answer: faker.paragraph({ sentence: 2 })
    }

    const response = await client.post('api/faqs').send(faq).end()

    response.assertStatus(201)

})

test("Get faq by id", async ({ client, assert }) => {

    const faqId = 1
    let faq = await Faq.find(faqId)
    faq = faq.toJSON()

    const response = await client.get(`api/faqs/${faqId}`).end()

    response.assertStatus(200)
    response.assertJSON(faq)

})

test("Update faq", async ({ client, assert }) => {

    const faqId = 1

    let beforeUpdateFaq = await Faq.find(faqId)
    beforeUpdateFaq = beforeUpdateFaq.toJSON()

    const fieldUpdate = {
        answer: faker.paragraph({ sentence: 2 })
    }

    const response = await client.put(`api/faqs/${faqId}`).send(fieldUpdate).end()

    response.assertStatus(200)
    assert.notEqual(beforeUpdateFaq.answer, response.body.answer)

})

test("Delete faq", async ({ client, assert }) => {

    // Create then delete
    const newFaq = await Faq.create({
        question: faker.sentence(),
        answer: faker.paragraph({ sentence: 2 })
    })

    const response = await client.delete(`api/faqs/${newFaq.id}`).end()

    const deletedFaq = await Faq.find(newFaq.id)

    response.assertStatus(200)
    assert.isNull(deletedFaq)

})