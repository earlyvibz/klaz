import { test } from '@japa/runner'
import User from '#models/user'
import School from '#models/school'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import limiter from '@adonisjs/limiter/services/main'

test.group('Students Imports', (group) => {
  let school: School
  let admin: User

  group.setup(async () => {
    school = await School.create({
      name: 'Test School',
      slug: 'test-school',
    })

    admin = await User.create({
      email: 'admin@test.com',
      password: 'Password123!',
      schoolId: school.id,
      role: 'ADMIN',
      isActive: true,
      level: 1,
      points: 0,
      invitationCode: crypto.randomUUID(),
    })
  })

  group.teardown(async () => {
    await User.query().delete()
    await School.query().delete()
    // Nettoyer le rate limiting entre les tests
    await limiter.clear(['memory'])
  })

  test('import students from valid CSV', async ({ client, assert }) => {
    // Créer un fichier CSV temporaire
    const csvContent = `email,name,groupe
john.doe@example.com,John Doe,L3 INFO
jane.smith@example.com,Jane Smith,L3 INFO
bob.wilson@example.com,Bob Wilson,L2 MATH`

    const csvPath = join(app.makePath('tmp'), 'test_students.csv')

    // Écrire le fichier de manière asynchrone
    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(200)
    response.assertBodyContains({
      imported: 3,
      message: 'Successfully imported 3 users',
    })

    const body = response.body()
    assert.equal(body.users.length, 3)
    assert.isOk(body.users[0].invitationCode)

    // Vérifier en base
    const users = await User.query().whereIn('email', [
      'john.doe@example.com',
      'jane.smith@example.com',
      'bob.wilson@example.com',
    ])

    assert.equal(users.length, 3)
    users.forEach((user) => {
      assert.equal(user.role, 'STUDENT')
      assert.isFalse(user.isActive)
      assert.isOk(user.invitationCode)
    })
  })

  test('cannot import CSV without admin rights', async ({ client }) => {
    const student = await User.create({
      email: 'student@test.com',
      password: 'Password123!',
      schoolId: school.id,
      role: 'STUDENT',
      isActive: true,
      level: 1,
      points: 0,
      invitationCode: crypto.randomUUID(),
    })

    const csvContent = 'email,name\ntest@example.com,Test User'
    const csvPath = join(app.makePath('tmp'), 'test_students2.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(student)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Admin rights required',
    })
  })

  test('reject CSV without email column', async ({ client }) => {
    const csvContent = 'name,groupe\nJohn Doe,L3 INFO'
    const csvPath = join(app.makePath('tmp'), 'test_no_email.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'CSV must contain an email column',
    })
  })

  test('skip duplicate emails in CSV', async ({ client, assert }) => {
    // Créer un utilisateur existant
    await User.create({
      email: 'existing@example.com',
      password: 'Password123!',
      schoolId: school.id,
      role: 'STUDENT',
      isActive: true,
      level: 1,
      points: 0,
      invitationCode: crypto.randomUUID(),
    })

    const csvContent = `email,name
existing@example.com,Existing User
new@example.com,New User`

    const csvPath = join(app.makePath('tmp'), 'test_duplicates.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.imported, 1) // Seulement le nouveau
    assert.equal(body.errors.length, 1) // Une erreur pour le doublon
    assert.include(body.errors[0], 'already exists')
  })

  test('get invitation codes for admin school', async ({ client, assert }) => {
    // Nettoyer les utilisateurs inactifs précédents
    await User.query().where('isActive', false).delete()

    // Créer des utilisateurs inactifs
    await User.createMany([
      {
        email: 'pending1@example.com',
        password: 'temppassword',
        schoolId: school.id,
        role: 'STUDENT',
        isActive: false,
        level: 1,
        points: 0,
        invitationCode: crypto.randomUUID(),
      },
      {
        email: 'pending2@example.com',
        password: 'temppassword',
        schoolId: school.id,
        role: 'STUDENT',
        isActive: false,
        level: 1,
        points: 0,
        invitationCode: crypto.randomUUID(),
      },
    ])

    const token = await User.accessTokens.create(admin)

    const response = await client
      .get('/students/invitation-codes')
      .bearerToken(token.value!.release())

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.users.length, 2)
    body.users.forEach((user: any) => {
      assert.isOk(user.invitationCode)
      assert.include(['pending1@example.com', 'pending2@example.com'], user.email)
    })
  })

  test('cannot access invitation codes without admin rights', async ({ client }) => {
    const student = await User.create({
      email: 'student2@test.com',
      password: 'Password123!',
      schoolId: school.id,
      role: 'STUDENT',
      isActive: true,
      level: 1,
      points: 0,
      invitationCode: crypto.randomUUID(),
    })

    const token = await User.accessTokens.create(student)

    const response = await client
      .get('/students/invitation-codes')
      .bearerToken(token.value!.release())

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Admin rights required',
    })
  })

  test('reject request without CSV file', async ({ client }) => {
    const token = await User.accessTokens.create(admin)

    const response = await client.post('/students/import').bearerToken(token.value!.release())

    response.assertStatus(422)
  })

  test('reject invalid file type', async ({ client }) => {
    const txtContent = 'This is not a CSV file'
    const txtPath = join(app.makePath('tmp'), 'invalid.txt')

    const fs = await import('node:fs/promises')
    await fs.writeFile(txtPath, txtContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', txtPath)

    response.assertStatus(422)
  })

  test('reject CSV with only header', async ({ client }) => {
    const csvContent = 'email,name'
    const csvPath = join(app.makePath('tmp'), 'header_only.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'CSV must contain at least a header and one student',
    })
  })

  test('reject CSV with invalid emails', async ({ client, assert }) => {
    const csvContent = `email,name
invalid-email,John Doe
not-an-email,Jane Smith`

    const csvPath = join(app.makePath('tmp'), 'invalid_emails.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'No valid students to import',
    })

    const body = response.body()
    assert.equal(body.errors.length, 2)
    assert.include(body.errors[0], 'Invalid email')
    assert.include(body.errors[1], 'Invalid email')
  })

  test('handle CSV with incomplete lines', async ({ client, assert }) => {
    const csvContent = `email,name,extra
john@example.com,John Doe,Group1
incomplete@example.com`

    const csvPath = join(app.makePath('tmp'), 'incomplete_lines.csv')

    const fs = await import('node:fs/promises')
    await fs.writeFile(csvPath, csvContent)

    const token = await User.accessTokens.create(admin)

    const response = await client
      .post('/students/import')
      .bearerToken(token.value!.release())
      .file('csv_file', csvPath)

    response.assertStatus(200)

    const body = response.body()
    // Seule la première ligne complète devrait être importée
    assert.equal(body.imported, 1)
    assert.equal(body.users[0].email, 'john@example.com')
  })
})
