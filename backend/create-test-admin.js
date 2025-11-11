const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    const email = 'admin@admin.com';
    const senha = 'admin123';

    console.log('👤 Criando novo admin de teste...\n');

    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  Usuário já existe. Atualizando senha...');

      const hashedPassword = await bcrypt.hash(senha, 10);
      await prisma.user.update({
        where: { email },
        data: {
          senha: hashedPassword,
          status: 'ATIVO'
        }
      });

      console.log('✅ Senha atualizada!\n');
    } else {
      const hashedPassword = await bcrypt.hash(senha, 10);

      await prisma.user.create({
        data: {
          nome: 'Admin Teste',
          email: email,
          cpf: '99999999999',
          senha: hashedPassword,
          tipo: 'ADMIN',
          status: 'ATIVO',
          telefone: '11999999999'
        }
      });

      console.log('✅ Admin criado com sucesso!\n');
    }

    console.log('━'.repeat(60));
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('━'.repeat(60));
    console.log('\n🧪 Testando login...\n');

    // Testar se funciona
    const user = await prisma.user.findUnique({
      where: { email }
    });

    const isValid = await bcrypt.compare(senha, user.senha);
    console.log(isValid ? '✅ Teste local: PASSOU' : '❌ Teste local: FALHOU');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
