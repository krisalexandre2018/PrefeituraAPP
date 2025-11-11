const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function setSuperAdmin() {
  try {
    const email = 'kris.alexandre2018@gmail.com';
    const novaSenha = 'admin123'; // Mesma senha que funciona

    console.log('👑 Configurando Super Admin...\n');

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    // Hash da nova senha (mesmo método que funcionou)
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar para Super Admin com senha nova
    await prisma.user.update({
      where: { email },
      data: {
        senha: hashedPassword,
        tipo: 'ADMIN',
        status: 'ATIVO',
        isSuperAdmin: true
      }
    });

    console.log('✅ Super Admin configurado com sucesso!\n');
    console.log('━'.repeat(70));
    console.log('👤 Nome:        Administrador');
    console.log('📧 Email:       ', email);
    console.log('🔑 Senha:       ', novaSenha);
    console.log('👑 Super Admin: SIM');
    console.log('━'.repeat(70));
    console.log('\n⚠️  Mude a senha após fazer login!\n');

    // Remover super admin do admin@admin.com
    await prisma.user.update({
      where: { email: 'admin@admin.com' },
      data: { isSuperAdmin: false }
    });

    console.log('✅ Super Admin removido de admin@admin.com\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperAdmin();
