import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('badge_id').notNullable().references('id').inTable('badges').onDelete('CASCADE')
      table.timestamp('earned_at').defaultTo(this.now())
      table.timestamps(true)

      table.unique(['user_id', 'badge_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
