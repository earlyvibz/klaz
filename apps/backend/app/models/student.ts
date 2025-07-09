import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import School from '#models/school'
import Group from '#models/group'
import QuestSubmission from '#models/quest_submission'
import RewardRedemption from '#models/reward_redemption'
import { v4 as uuidv4 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Student extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare level: number

  @column()
  declare points: number

  @column()
  declare schoolId: string

  @column()
  declare groupId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>

  @hasMany(() => QuestSubmission)
  declare questSubmissions: HasMany<typeof QuestSubmission>

  @hasMany(() => RewardRedemption)
  declare rewardRedemptions: HasMany<typeof RewardRedemption>

  @beforeCreate()
  public static async assignId(model: Student) {
    model.id = uuidv4()
  }

  static accessTokens = DbAccessTokensProvider.forModel(Student)
}
