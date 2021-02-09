'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('admins', (_, i, data) => {
    return data
})

Factory.blueprint('provinces', (_, i, data) => {
    return {
        id: data.province_id,
        name: data.province_name
    }
})

Factory.blueprint('cities', (_, i, data) => {
    return {
        id: data.city_id,
        province_id: data.province_id,
        name: data.city_name
    }
})

Factory.blueprint('districts', (_, i, data) => {
    return {
        id: data.district_id,
        city_id: data.city_id,
        name: data.district_name
    }
})
