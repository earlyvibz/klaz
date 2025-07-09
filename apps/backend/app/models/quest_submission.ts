import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Quest from '#models/quest'
import Student from '#models/student'
import { v4 as uuidv4 } from 'uuid'

export default class QuestSubmission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare questId: string

  @column()
  declare proofUrl: string

  @column()
  declare status: 'PENDING' | 'APPROVED' | 'REJECTED'

  @column.dateTime()
  declare submittedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Quest)
  declare quest: BelongsTo<typeof Quest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async assignId(model: QuestSubmission) {
    model.id = uuidv4()
  }
}
