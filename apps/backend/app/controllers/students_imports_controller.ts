import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { v4 as uuidv4 } from 'uuid'
import app from '@adonisjs/core/services/app'
import { importStudentsValidator } from '#validators/students_import'
import type { CreateUserData } from '#types/students'

export default class StudentsImportsController {
  async import({ request, auth, response }: HttpContext) {
    const { csv_file: csvFile } = await request.validateUsing(importStudentsValidator)

    const user = auth.user!
    const schoolId = user.schoolId

    try {
      await csvFile.move(app.makePath('tmp/uploads'), {
        name: `${uuidv4()}.csv`,
      })

      const fs = await import('node:fs/promises')
      const csvText = await fs.readFile(csvFile.filePath!, 'utf-8')
      const lines = csvText.split('\n').filter((line: string) => line.trim())

      if (lines.length < 2) {
        return response.badRequest({
          message: 'CSV must contain at least a header and one student',
        })
      }

      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase())
      const emailIndex = headers.findIndex((h: string) => h.includes('email'))
      const nameIndex = headers.findIndex((h: string) => h.includes('name') || h.includes('nom'))

      if (emailIndex === -1) {
        return response.badRequest({ message: 'CSV must contain an email column' })
      }

      const studentsData: CreateUserData[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v: string) => v.trim())

        if (values.length < headers.length) continue

        const email = values[emailIndex]
        const fullName = nameIndex !== -1 ? values[nameIndex] : null

        if (!email || !email.includes('@')) {
          errors.push(`Line ${i + 1}: Invalid email "${email}"`)
          continue
        }

        const existingUser = await User.findBy('email', email)
        if (existingUser) {
          errors.push(`Line ${i + 1}: User with email "${email}" already exists`)
          continue
        }

        studentsData.push({
          email,
          fullName,
          password: crypto.randomUUID(),
          invitationCode: uuidv4(),
          schoolId,
          role: 'STUDENT',
          isActive: false,
          level: 1,
          points: 0,
        })
      }

      if (studentsData.length === 0) {
        return response.badRequest({
          message: 'No valid students to import',
          errors,
        })
      }

      const createdUsers = await User.createMany(studentsData)

      return response.ok({
        message: `Successfully imported ${createdUsers.length} users`,
        imported: createdUsers.length,
        errors: errors.length > 0 ? errors : null,
        users: createdUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          invitationCode: u.invitationCode,
        })),
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Error processing CSV file',
        error: error.message,
      })
    }
  }

  async getInvitationCodes({ auth, response }: HttpContext) {
    const user = auth.user!
    const users = await User.query()
      .where('schoolId', user.schoolId)
      .where('isActive', false)
      .select('id', 'email', 'fullName', 'invitationCode', 'createdAt')
      .orderBy('createdAt', 'desc')

    return response.ok({ users })
  }
}
