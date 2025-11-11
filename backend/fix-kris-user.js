const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixUser() {
  try {
    const email = 'kris.alexandre2018@gmail.com';
    const novaSenha = 'admin123';

    console.log('🔧 Corrigindo usuário...\n');

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    // Criar novo hash (mesmo método do admin@admin.com que funcionou)
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar completamente
    await prisma.user.update({
      where: { email },
      data: {
        senha: hashedPassword,
        status: 'ATIVO'
      }
    });

    console.log('✅ Usuário corrigido!\n');
    console.log('━'.repeat(60));
    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', novaSenha);
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();
