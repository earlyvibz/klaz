import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import School from '#models/school'

export default class extends BaseSeeder {
  async run() {
    // Créer une école de démonstration
    const school = await School.firstOrCreate(
      { slug: 'demo-school' },
      {
        name: 'École de Démonstration',
        slug: 'demo-school',
      }
    )

    // Créer un super admin
    await User.firstOrCreate(
      { email: 'admin@klaz.com' },
      {
        email: 'admin@klaz.com',
        password: 'Password123!',
        fullName: 'Super Admin',
        role: 'SUPERADMIN',
        schoolId: school.id,
        isActive: true,
        level: 1,
        points: 0,
        invitationCode: crypto.randomUUID(),
      }
    )

    console.log('✅ Super admin créé: admin@klaz.com / Password123!')
  }
}
