import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add indexes for products table
    this.schema.alterTable('products', (table) => {
      // Composite index for active products by school (most common query)
      table.index(['school_id', 'is_active'], 'products_school_active_idx')

      // Index for title search
      table.index(['title'], 'products_title_idx')

      // Index for price sorting
      table.index(['price_points'], 'products_price_idx')

      // Index for stock filtering
      table.index(['supply'], 'products_supply_idx')

      // Index for creation date sorting
      table.index(['created_at'], 'products_created_at_idx')
    })

    // Add indexes for product_purchases table
    this.schema.alterTable('product_purchases', (table) => {
      // Composite index for user purchases by product and status (for purchase limits)
      table.index(['user_id', 'product_id', 'status'], 'purchases_user_product_status_idx')

      // Index for admin purchase management
      table.index(['status', 'created_at'], 'purchases_status_created_idx')
    })
  }

  async down() {
    this.schema.alterTable('products', (table) => {
      table.dropIndex(['school_id', 'is_active'], 'products_school_active_idx')
      table.dropIndex(['title'], 'products_title_idx')
      table.dropIndex(['price_points'], 'products_price_idx')
      table.dropIndex(['supply'], 'products_supply_idx')
      table.dropIndex(['created_at'], 'products_created_at_idx')
    })

    this.schema.alterTable('product_purchases', (table) => {
      table.dropIndex(['user_id', 'product_id', 'status'], 'purchases_user_product_status_idx')
      table.dropIndex(['status', 'created_at'], 'purchases_status_created_idx')
    })
  }
}
