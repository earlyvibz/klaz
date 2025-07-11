import User from '#models/user'
import env from '#start/env'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  signupValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { v4 as uuidv4 } from 'uuid'

export default class AuthController {
  async register({ request }: HttpContext) {
    const { email, password, schoolId } = await request.validateUsing(registerValidator)
    const user = await User.create({
      email,
      password,
      schoolId,
      role: 'STUDENT',
      invitationCode: uuidv4(),
      isActive: true,
      level: 1,
      points: 0,
    })
    return User.accessTokens.create(user)
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)
    if (!user) {
      return response.badRequest({ message: 'Invalid credentials' })
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return response.badRequest({
        message: 'Account temporarily locked due to too many failed attempts',
      })
    }

    try {
      await User.verifyCredentials(email, password)
      await user.resetFailedAttempts()
      return User.accessTokens.create(user)
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      await user.incrementFailedAttempts()
      return response.badRequest({ message: 'Invalid credentials' })
    }
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { message: 'Logged out successfully' }
  }

  async me({ auth }: HttpContext) {
    await auth.check()

    return {
      user: auth.user,
    }
  }

  async signup({ request, response }: HttpContext) {
    const { invitationCode, password } = await request.validateUsing(signupValidator)

    const user = await User.findBy('invitationCode', invitationCode)
    if (!user) {
      return response.badRequest({ message: 'Invalid invitation code' })
    }

    if (user.isActive) {
      return response.badRequest({ message: 'This invitation code has already been used' })
    }

    user.password = password
    user.isActive = true
    user.emailVerified = true // Auto-verify email for invited users
    await user.save()

    return User.accessTokens.create(user)
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    const user = await User.findBy('email', email)
    if (!user) {
      // Don't reveal if email exists, always return success
      return response.ok({ message: 'If the email exists, a reset link has been sent' })
    }

    const resetToken = await user.generatePasswordResetToken()

    await mail.send((message) => {
      message.to(email)
      message.subject('Password Reset Request')
      message.html(`
        <p>Hello,</p>
        <p>You have requested a password reset. Please click the link below to reset your password:</p>
        <a href="${env.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}">Reset Password</a>
      `)
    })

    return response.ok({ message: 'If the email exists, a reset link has been sent' })
  }

  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const user = await User.findBy('resetPasswordToken', token)
    if (!user || !user.isPasswordResetTokenValid(token)) {
      return response.badRequest({ message: 'Invalid or expired reset token' })
    }

    user.password = password
    await user.clearPasswordResetToken()
    await user.resetFailedAttempts() // Clear any failed attempts

    return response.ok({ message: 'Password has been reset successfully' })
  }

  async logoutAllDevices({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens
      .all(user)
      .then((tokens) =>
        Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))
      )

    return response.ok({ message: 'Logged out from all devices' })
  }
}
