'use strict'

const { test, trait } = use('Test/Suite')('Testimonial')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/Testimonial')} */
const Testimonial = use('App/Models/Testimonial')

const Helpers = use('Helpers')

trait('Test/ApiClient')
trait('Auth/Client')

test("Get all testimonials", async ({ client, assert }) => {

    let testimonials = await Testimonial.all()
    testimonials = testimonials.toJSON()

    const response = await client.get('/api/testimonials').end()

    response.assertStatus(200)
    response.assertJSON(testimonials)

})

test("Add a testimonials", async ({ client, assert }) => {

    const response = await client.post('api/testimonials')
        .field('reviewer_name', faker.name())
        .field('testi', faker.paragraph({ sentence: 2 }))
        .attach('picture', Helpers.tmpPath('avatar.png'))
        .end()

    response.assertStatus(201)

})

test("Get testimonial by id", async ({ client, assert }) => {

    const testimonialId = 1
    let testimonial = await Testimonial.find(testimonialId)
    testimonial = testimonial.toJSON()

    const response = await client.get(`api/testimonials/${testimonialId}`).end()

    response.assertStatus(200)
    response.assertJSON(testimonial)

})

test("Update testimonial", async ({ client, assert }) => {

    const testimonialId = 1

    let beforeUpdateTestimonial = await Testimonial.find(testimonialId)
    beforeUpdateTestimonial = beforeUpdateTestimonial.toJSON()

    const response = await client.put(`api/testimonials/${testimonialId}`)
        .field("testi", faker.paragraph({ sentence: 2 }))
        .end()

    response.assertStatus(200)
    assert.notEqual(beforeUpdateTestimonial.testi, response.body.testi)

})

test("Delete testimonial", async ({ client, assert }) => {

    // Create then delete
    const newTestimonial = await Testimonial.create({
        reviewer_name: faker.name(),
        testi: faker.paragraph({ sentence: 2 }),
        picture_name: Helpers.tmpPath('avatar.png')
    })

    const response = await client.delete(`api/testimonials/${newTestimonial.id}`).end()

    const deletedTestimonial = await Testimonial.find(newTestimonial.id)

    response.assertStatus(200)
    assert.isNull(deletedTestimonial)

})

test("Pick last-n of testimonials", async ({ client, assert }) => {

    const n = 3
    let testimonials = await Testimonial.pickInverse(n)
    testimonials = testimonials.toJSON()

    const response = await client.get(`api/testimonials?pick=${3}`).end()

    response.assertStatus(200)
    response.assertJSON(testimonials)

})