import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from '#models/school'
import QuestSubmission from '#models/quest_submission'
import { v4 as uuidv4 } from 'uuid'

export default class Quest extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare type: string // ex: 'UGC', 'SOCIAL', 'EVENT'

  @column()
  declare points: number

  @column.dateTime({ autoCreate: false })
  declare deadline?: DateTime

  @column()
  declare validationType: 'MANUAL' | 'AUTO_API'

  @column()
  declare schoolId: string

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => QuestSubmission)
  declare submissions: HasMany<typeof QuestSubmission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async assignId(model: Quest) {
    model.id = uuidv4()
  }
}
