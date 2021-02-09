'use strict'

/*
|--------------------------------------------------------------------------
| LocationSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

const csv = require('csvtojson');
const provinceCsv = __dirname + '/resources/provinces.csv';
const cityCsv = __dirname + '/resources/regencies.csv';
const districtCsv = __dirname + '/resources/districts.csv';

class LocationSeeder {
    async run() {
        const provinces = await csv().fromFile(provinceCsv);
        let size = provinces.length;
        let i = 1;

        for (const province of provinces) {
            console.log(i, "/", size);
            await Factory.get('provinces').create(province);
            i += 1
        }

        const cities = await csv().fromFile(cityCsv);
        size = cities.length;
        for (let city of cities) {
            console.log(i, "/", size);
            await Factory.get('cities').create(city);
            i += 1
        }

        const districts = await csv().fromFile(districtCsv);
        size = districts.length;
        for (let district of districts) {
            console.log(i, "/", size);
            await Factory.get('districts').create(district);
            i += 1
        }
    }
}

module.exports = LocationSeeder;
