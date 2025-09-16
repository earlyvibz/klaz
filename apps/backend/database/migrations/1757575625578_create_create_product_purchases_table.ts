import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_purchases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .uuid('product_id')
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.integer('price_points_per_unit').notNullable()
      table.integer('total_points').notNullable()
      table.string('status').defaultTo('completed')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
