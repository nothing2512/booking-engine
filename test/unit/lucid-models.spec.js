'use strict'

const { test } = use('Test/Suite')('Lucid Models')

/** @type {import('@adonisjs/lucid/src/Factory/chance')} */
const faker = use('Chance')

/** @type {typeof import('../../app/Models/Role')} */
const Role = use('App/Models/Role')

/** @type {typeof import('../../app/Models/User')} */
const User = use('App/Models/User')

/** @type {typeof import('../../app/Models/UserProfile')} */
const UserProfile = use('App/Models/UserProfile')

/** @type {typeof import('../../app/Models/News')} */
const News = use('App/Models/News')

/** @type {typeof import('../../app/Models/NewsCategory')} */
const NewsCategory = use('App/Models/NewsCategory')

test('Get from database null if not exist', async ({ assert }) => {

  const user = await User.find(999)
  assert.isNull(user)

})

test.skip('Ensure news and its category relationship is correct', async ({ assert }) => {

  let category = await NewsCategory.create({ name: "Ngaji Fiqih" })

  let news = await News.create({
    content: faker.paragraph(),
    title: faker.sentence({ words: 3 }),
    category_id: category.id,
    header_image: faker.guid() + '.jpg',
    author_admin_id: 1
  })

  let newsCategory = await news.category().fetch()
  newsCategory = newsCategory.toJSON()
  news = news.toJSON()
  news.category = newsCategory

  assert.hasAnyKeys(news, ['category'])
  assert.isNotEmpty(news.category)
  assert.equal(news.category.name, "Ngaji Fiqih")

})

test('test role', async (assert) => {

  const user = new User()
  const profile = new UserProfile()
  const role = new Role()

  role.id = 1
  role.name = 'Aggregator'
  role.slug = 'aggregator'
  role.description = 'Logginable aggregator'

  user.role_id = role.id

  user.setRelated('role', role)
  user.setRelated('profile', profile)

})

test('Test find by', async ({assert}) => {

  const user = await User.findBy('role_id', 3)
  assert.isNotArray(user)

})