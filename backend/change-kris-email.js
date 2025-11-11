const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function changeEmail() {
  try {
    await prisma.user.update({
      where: { email: 'kris.alexandre2018@gmail.com' },
      data: { email: 'kris@admin.com' }
    });

    console.log('✅ Email atualizado com sucesso!\n');
    console.log('━'.repeat(60));
    console.log('📧 Novo email: kris@admin.com');
    console.log('🔑 Senha:      admin123');
    console.log('👑 Super Admin: SIM');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

changeEmail();
