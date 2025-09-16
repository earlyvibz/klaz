import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('image').nullable()
      table.integer('price_points').notNullable()
      table.integer('supply').notNullable().defaultTo(0)
      table
        .uuid('school_id')
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
