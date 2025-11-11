const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('🔍 Conectando ao banco do Render...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        tipo: true,
        status: true,
        telefone: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
      console.log('\n💡 Você precisa criar um usuário primeiro.');
      console.log('   Execute: node backend/criar-admin.js');
    } else {
      console.log(`✅ Encontrados ${users.length} usuário(s):\n`);
      console.log('━'.repeat(100));

      users.forEach((user, index) => {
        console.log(`\n👤 Usuário ${index + 1}:`);
        console.log(`   ID:       ${user.id}`);
        console.log(`   Nome:     ${user.nome}`);
        console.log(`   Email:    ${user.email}`);
        console.log(`   CPF:      ${user.cpf}`);
        console.log(`   Tipo:     ${user.tipo}`);
        console.log(`   Status:   ${user.status}`);
        console.log(`   Telefone: ${user.telefone || 'Não informado'}`);
        console.log(`   Criado:   ${user.createdAt.toLocaleString('pt-BR')}`);
        console.log('━'.repeat(100));
      });

      console.log('\n📊 Resumo:');
      const resumo = users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {});

      Object.entries(resumo).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);

    if (error.message.includes('connect')) {
      console.log('\n💡 Problema de conexão com o banco de dados.');
      console.log('   Verifique se a DATABASE_URL está correta no .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
