import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_purchases'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('claimed_at').nullable()
      table.string('claimed_by_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('claimed_at')
      table.dropColumn('claimed_by_id')
    })
  }
}
