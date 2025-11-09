const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'krisalexandre2018@gmail.com' },
      data: { status: 'ATIVO' }
    });

    console.log('✅ Usuário aprovado com sucesso!');
    console.log('Nome:', user.nome);
    console.log('Email:', user.email);
    console.log('Tipo:', user.tipo);
    console.log('Status:', user.status);
  } catch (error) {
    console.error('❌ Erro ao aprovar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

approveUser();
