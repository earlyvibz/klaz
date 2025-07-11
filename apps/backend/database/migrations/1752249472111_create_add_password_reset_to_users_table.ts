import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('reset_password_token').nullable()
      table.timestamp('reset_password_expires').nullable()
      table.timestamp('last_login_at').nullable()
      table.integer('failed_login_attempts').defaultTo(0)
      table.timestamp('locked_until').nullable()
      table.boolean('email_verified').defaultTo(false)
      table.string('email_verification_token').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reset_password_token')
      table.dropColumn('reset_password_expires')
      table.dropColumn('last_login_at')
      table.dropColumn('failed_login_attempts')
      table.dropColumn('locked_until')
      table.dropColumn('email_verified')
      table.dropColumn('email_verification_token')
    })
  }
}
