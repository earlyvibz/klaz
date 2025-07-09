import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Quest from '#models/quest'
import Student from '#models/student'
import Group from '#models/group'
import Reward from '#models/reward'
import { v4 as uuidv4 } from 'uuid'

export default class School extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @hasMany(() => Group)
  declare groups: HasMany<typeof Group>

  @hasMany(() => Student)
  declare students: HasMany<typeof Student>

  @hasMany(() => Quest)
  declare quests: HasMany<typeof Quest>

  @hasMany(() => Reward)
  declare rewards: HasMany<typeof Reward>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async assignId(model: School) {
    model.id = uuidv4()
  }
}
