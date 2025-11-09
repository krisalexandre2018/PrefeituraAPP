// IMPORTANTE: Execute este script APÓS reiniciar o backend
// Este script marca um usuário específico como Super Admin

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = 'krisalexandre2018@gmail.com'; // SEU EMAIL AQUI

async function setSuperAdmin() {
  try {
    console.log(`Buscando usuário: ${SUPER_ADMIN_EMAIL}...`);

    const user = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL }
    });

    if (!user) {
      console.error(`❌ Usuário não encontrado: ${SUPER_ADMIN_EMAIL}`);
      console.log('Certifique-se de que o email está correto');
      return;
    }

    console.log(`Promovendo ${user.nome} a Super Admin...`);

    const updated = await prisma.user.update({
      where: { email: SUPER_ADMIN_EMAIL },
      data: {
        tipo: 'ADMIN',
        status: 'ATIVO',
        isSuperAdmin: true
      }
    });

    console.log('✅ Super Admin configurado com sucesso!');
    console.log('Nome:', updated.nome);
    console.log('Email:', updated.email);
    console.log('Tipo:', updated.tipo);
    console.log('Status:', updated.status);
    console.log('Super Admin:', updated.isSuperAdmin);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperAdmin();
