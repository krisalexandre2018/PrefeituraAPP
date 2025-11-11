const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = process.argv[2];
    const novaSenha = process.argv[3];

    if (!email || !novaSenha) {
      console.log('❌ Uso: node reset-password-dynamic.js <email> <nova_senha>');
      console.log('   Exemplo: node reset-password-dynamic.js kris@admin.com 123456');
      process.exit(1);
    }

    console.log('🔐 Resetando senha do usuário...\n');

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      console.log('\n📋 Emails disponíveis:');
      const users = await prisma.user.findMany({ select: { email: true, nome: true } });
      users.forEach(u => console.log(`   - ${u.email} (${u.nome})`));
      process.exit(1);
    }

    console.log('✅ Usuário encontrado!');
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Tipo: ${user.tipo}`);
    console.log(`   Status: ${user.status}\n`);

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
    console.log('\n⚠️  IMPORTANTE: Use uma senha forte em produção!\n');

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
