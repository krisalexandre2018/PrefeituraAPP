const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        status: true,
        isSuperAdmin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📋 TODOS OS USUÁRIOS NO BANCO:\n');

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tipo: ${user.tipo}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Super Admin: ${user.isSuperAdmin ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`   Cadastrado em: ${user.createdAt.toLocaleString('pt-BR')}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
