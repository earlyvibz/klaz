import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable().unique()
      table.text('description').nullable()
      table.string('icon').nullable()
      table.string('color').defaultTo('#3B82F6')
      table.integer('required_level').nullable()
      table.integer('required_quests').nullable()
      table.integer('required_points').nullable()
      table.string('badge_type').defaultTo('achievement') // achievement, milestone, special
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
