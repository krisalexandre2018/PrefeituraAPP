// Script para criar Super Admin
// Execute com: node criar-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function criarAdmin() {
  try {
    console.log('🔐 Criando Super Admin...\n');

    // Dados do admin
    const email = 'kris.alexandre2018@gmail.com';
    const senha = 'admin123'; // MUDE esta senha depois do primeiro login!
    const cpf = '00000971409';

    // Verificar se já existe
    const adminExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (adminExistente) {
      console.log('⚠️  Admin já existe! Atualizando...');

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Atualizar para garantir que é ADMIN e ATIVO
      const admin = await prisma.user.update({
        where: { email },
        data: {
          tipo: 'ADMIN',
          status: 'ATIVO',
          senha: senhaHash
        }
      });

      console.log('✅ Admin atualizado com sucesso!');
      console.log('\n📧 Email:', admin.email);
      console.log('👤 Nome:', admin.nome);
      console.log('🔑 CPF:', admin.cpf);
      console.log('📱 Tipo:', admin.tipo);
      console.log('✓ Status:', admin.status);
      console.log('\n🔐 Senha temporária: admin123');
      console.log('⚠️  IMPORTANTE: Mude a senha no primeiro login!\n');

    } else {
      console.log('➕ Criando novo admin...');

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar admin
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          cpf: cpf,
          email: email,
          senha: senhaHash,
          telefone: '(00) 00000-0000',
          tipo: 'ADMIN',
          status: 'ATIVO'
        }
      });

      console.log('✅ Admin criado com sucesso!');
      console.log('\n📧 Email:', admin.email);
      console.log('👤 Nome:', admin.nome);
      console.log('🔑 CPF:', admin.cpf);
      console.log('📱 Tipo:', admin.tipo);
      console.log('✓ Status:', admin.status);
      console.log('\n🔐 Senha temporária: admin123');
      console.log('⚠️  IMPORTANTE: Mude a senha no primeiro login!\n');
    }

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();
