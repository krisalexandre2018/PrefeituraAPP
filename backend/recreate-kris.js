const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function recreate() {
  try {
    const email = 'kris.alexandre2018@gmail.com';
    const senha = 'admin123';

    console.log('🔄 Recriando usuário kris...\n');

    // Deletar usuário antigo se existir
    const oldUser = await prisma.user.findUnique({ where: { email } });

    if (oldUser) {
      // Deletar ocorrências primeiro (se houver)
      await prisma.ocorrencia.deleteMany({
        where: { vereadorId: oldUser.id }
      });

      // Deletar notificações
      await prisma.notificacao.deleteMany({
        where: { usuarioId: oldUser.id }
      });

      // Deletar usuário
      await prisma.user.delete({ where: { email } });
      console.log('✅ Usuário antigo deletado\n');
    }

    // Criar novo usuário limpo
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome: 'Administrador',
        email: email,
        cpf: '00000971409',
        senha: hashedPassword,
        tipo: 'ADMIN',
        status: 'ATIVO',
        telefone: '(00) 00000-0000',
        isSuperAdmin: true
      }
    });

    console.log('✅ Novo usuário criado!\n');
    console.log('━'.repeat(70));
    console.log('👤 Nome:        Administrador');
    console.log('📧 Email:       ', email);
    console.log('🔑 Senha:       ', senha);
    console.log('👑 Super Admin: SIM');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'P2002') {
      console.log('\n💡 CPF já existe. Tentando com CPF diferente...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

recreate();
