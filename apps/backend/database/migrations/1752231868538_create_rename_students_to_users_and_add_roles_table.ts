import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  async up() {
    this.schema.renameTable('students', 'users')

    this.schema.alterTable('users', (table) => {
      table.enum('role', ['STUDENT', 'ADMIN', 'SUPERADMIN']).defaultTo('STUDENT').after('password')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('role')
    })

    this.schema.renameTable('users', 'students')
  }
}
