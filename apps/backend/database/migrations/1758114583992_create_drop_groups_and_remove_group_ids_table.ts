import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Remove group_id column from users table
    this.schema.alterTable('users', (table) => {
      table.dropColumn('group_id')
    })

    // Drop groups table
    this.schema.dropTable('groups')
  }

  async down() {
    // Recreate groups table
    this.schema.createTable('groups', (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE')
      table.timestamps(true)
    })

    // Add group_id column back to users table
    this.schema.alterTable('users', (table) => {
      table.uuid('group_id').nullable().references('id').inTable('groups')
    })
  }
}
