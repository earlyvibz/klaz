import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // This migration ensures groups-related cleanup
    // Safe operations that won't fail if items don't exist

    try {
      // Check if group_id column exists and drop it if it does
      const hasGroupIdColumn = await this.schema.hasColumn('users', 'group_id')
      if (hasGroupIdColumn) {
        await this.schema.alterTable('users', (table) => {
          table.dropColumn('group_id')
        })
      }
    } catch (error) {
      // Column might not exist, that's fine
      console.log('group_id column not found or already removed')
    }

    try {
      // Check if groups table exists and drop it if it does
      const hasGroupsTable = await this.schema.hasTable('groups')
      if (hasGroupsTable) {
        await this.schema.dropTable('groups')
      }
    } catch (error) {
      // Table might not exist, that's fine
      console.log('groups table not found or already removed')
    }
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
