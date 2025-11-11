const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'kris.alexandre2018@gmail.com';
    const novaSenha = '123456'; // Senha padrão - MUDE DEPOIS DO LOGIN!

    console.log('🔐 Resetando senha do usuário...\n');

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { email },
      data: { senha: hashedPassword }
    });

    console.log('✅ Senha atualizada com sucesso!\n');
    console.log('━'.repeat(60));
    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', novaSenha);
    console.log('━'.repeat(60));
    console.log('\n⚠️  IMPORTANTE: Mude essa senha após fazer login!');
    console.log('   Use uma senha forte e segura.\n');

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
