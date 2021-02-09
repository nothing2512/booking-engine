'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CostDistributionSchema extends Schema {
    up() {
        this.create('cost_distributions', (table) => {
            table.bigIncrements()

            table.integer('aggregator_id')
            table.integer("bacatarot").defaultTo(20)
            table.integer("aggregator").defaultTo(20)
            table.integer("reader").defaultTo(80)

            table.timestamps()
        })
    }

    down() {
        this.drop('cost_distributions')
    }
}

module.exports = CostDistributionSchema
