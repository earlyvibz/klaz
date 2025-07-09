import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth'
import Student from '#models/student'

export default class AuthController {
  async register({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(registerValidator)
    const student = await Student.create({ email, password })
    return Student.accessTokens.create(student)
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const student = await Student.verifyCredentials(email, password)
    return Student.accessTokens.create(student)
  }

  async logout({ auth }: HttpContext) {
    const student = auth.user!
    await Student.accessTokens.delete(student, student.currentAccessToken.identifier)
    return { message: 'Logged out successfully' }
  }

  async me({ auth }: HttpContext) {
    await auth.check()

    return {
      student: auth.user,
    }
  }
}
