const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingAdmin) {
      console.log('🔐 Un super administrateur existe déjà');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Nom: ${existingAdmin.name}`);
      return;
    }

    // Créer le premier super administrateur
    const adminPassword = 'admin123'; // Mot de passe par défaut
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@stockmanagement.com',
        password: hashedPassword,
        name: 'Super Administrateur',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Super administrateur créé avec succès!');
    console.log('📧 Email: admin@stockmanagement.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    console.log(`🆔 ID: ${admin.id}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 