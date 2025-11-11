const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function debug() {
  try {
    const email = 'kris.alexandre2018@gmail.com';

    console.log('🔍 Investigando problema...\n');

    // Buscar usuário exatamente como a API faz
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado com email:', email);

      // Buscar todos os emails similares
      const allUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'kris'
          }
        }
      });

      console.log('\n📋 Usuários com "kris" no email:');
      allUsers.forEach(u => {
        console.log(`   - "${u.email}" (${u.email.length} caracteres)`);
      });

      process.exit(1);
    }

    console.log('✅ Usuário encontrado!\n');
    console.log('Email no banco:', `"${user.email}"`);
    console.log('Tamanho:', user.email.length, 'caracteres');
    console.log('Bytes:', Buffer.from(user.email).toString('hex'));

    console.log('\nStatus:', user.status);
    console.log('Tipo:', user.tipo);
    console.log('Super Admin:', user.isSuperAdmin);

    console.log('\n🔐 Hash da senha:');
    console.log(user.senha.substring(0, 20) + '...');

    console.log('\n🧪 Testando senha "admin123"...');
    const test = await bcrypt.compare('admin123', user.senha);
    console.log(test ? '✅ Senha correta!' : '❌ Senha incorreta!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
