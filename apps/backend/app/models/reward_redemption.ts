import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import Reward from '#models/reward'
import { v4 as uuidv4 } from 'uuid'

export default class RewardRedemption extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare rewardId: string

  @column()
  declare studentId: string

  @column()
  declare status: 'PENDING' | 'VALIDATED' | 'CANCELED'

  @column.dateTime()
  declare redeemedAt: DateTime

  @belongsTo(() => Reward)
  declare reward: BelongsTo<typeof Reward>

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async assignId(model: RewardRedemption) {
    model.id = uuidv4()
  }
}
