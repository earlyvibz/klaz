import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from '#models/school'
import User from '#models/user'
import { v4 as uuidv4 } from 'uuid'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare schoolId: string

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async assignId(model: Group) {
    model.id = uuidv4()
  }
}
