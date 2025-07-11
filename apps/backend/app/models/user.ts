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

export default class User extends compose(BaseModel, AuthFinder) {
  static table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'STUDENT' | 'ADMIN' | 'SUPERADMIN'

  @column()
  declare level: number

  @column()
  declare points: number

  @column()
  declare schoolId: string

  @column()
  declare groupId: string | null

  @column()
  declare invitationCode: string

  @column()
  declare isActive: boolean

  @column()
  declare resetPasswordToken: string | null

  @column.dateTime()
  declare resetPasswordExpires: DateTime | null

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column()
  declare failedLoginAttempts: number

  @column.dateTime()
  declare lockedUntil: DateTime | null

  @column()
  declare emailVerified: boolean

  @column()
  declare emailVerificationToken: string | null

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
  public static async assignId(model: User) {
    model.id = uuidv4()
  }

  // Helper methods for roles
  isStudent(): boolean {
    return this.role === 'STUDENT'
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN'
  }

  isSuperAdmin(): boolean {
    return this.role === 'SUPERADMIN'
  }

  hasAdminRights(): boolean {
    return this.role === 'ADMIN' || this.role === 'SUPERADMIN'
  }

  canManageSchool(schoolId: string): boolean {
    if (this.isSuperAdmin()) return true
    if (this.isAdmin() && this.schoolId === schoolId) return true
    return false
  }

  // Security helper methods
  isAccountLocked(): boolean {
    if (!this.lockedUntil) return false
    return this.lockedUntil > DateTime.now()
  }

  async incrementFailedAttempts(): Promise<void> {
    this.failedLoginAttempts += 1

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = DateTime.now().plus({ minutes: 30 })
    }

    await this.save()
  }

  async resetFailedAttempts(): Promise<void> {
    this.failedLoginAttempts = 0
    this.lockedUntil = null
    this.lastLoginAt = DateTime.now()
    await this.save()
  }

  async generatePasswordResetToken(): Promise<string> {
    const token = uuidv4()
    this.resetPasswordToken = token
    this.resetPasswordExpires = DateTime.now().plus({ hours: 1 }) // 1 hour expiry
    await this.save()
    return token
  }

  async clearPasswordResetToken(): Promise<void> {
    this.resetPasswordToken = null
    this.resetPasswordExpires = null
    await this.save()
  }

  isPasswordResetTokenValid(token: string): boolean {
    if (!this.resetPasswordToken || !this.resetPasswordExpires) return false
    if (this.resetPasswordToken !== token) return false
    return this.resetPasswordExpires > DateTime.now()
  }

  async generateEmailVerificationToken(): Promise<string> {
    const token = uuidv4()
    this.emailVerificationToken = token
    await this.save()
    return token
  }

  async verifyEmail(token: string): Promise<boolean> {
    if (this.emailVerificationToken !== token) return false
    this.emailVerified = true
    this.emailVerificationToken = null
    await this.save()
    return true
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
