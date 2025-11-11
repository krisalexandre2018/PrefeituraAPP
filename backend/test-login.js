const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Perguntar qual email você está tentando logar
    const email = process.argv[2];
    const senha = process.argv[3];

    if (!email || !senha) {
      console.log('❌ Uso: node test-login.js <email> <senha>');
      console.log('   Exemplo: node test-login.js kris@admin.com suasenha');
      process.exit(1);
    }

    console.log('🔍 Testando login...\n');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${'*'.repeat(senha.length)}\n`);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário NÃO encontrado com este email!');
      console.log('\n📋 Emails disponíveis no banco:');
      const users = await prisma.user.findMany({ select: { email: true, nome: true } });
      users.forEach(u => console.log(`   - ${u.email} (${u.nome})`));
      process.exit(1);
    }

    console.log('✅ Usuário encontrado!');
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Tipo: ${user.tipo}`);
    console.log(`   Status: ${user.status}\n`);

    // Verificar status
    if (user.status === 'PENDENTE') {
      console.log('⚠️  PROBLEMA: Conta aguardando aprovação do administrador');
      console.log('   Você precisa ser aprovado antes de fazer login!');
      process.exit(1);
    }

    if (user.status === 'INATIVO') {
      console.log('⚠️  PROBLEMA: Conta desativada');
      console.log('   Entre em contato com o administrador');
      process.exit(1);
    }

    // Verificar senha
    console.log('🔐 Verificando senha...');
    console.log(`   Hash no banco: ${user.senha.substring(0, 30)}...`);

    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (isValidPassword) {
      console.log('✅ SENHA CORRETA! Login deveria funcionar.\n');
      console.log('🎯 Possíveis problemas:');
      console.log('   1. App mobile pode estar usando URL errada da API');
      console.log('   2. Pode haver problema de rede/conexão');
      console.log('   3. CSRF token pode estar bloqueando (se habilitado)');
    } else {
      console.log('❌ SENHA INCORRETA!\n');
      console.log('🎯 Possíveis causas:');
      console.log('   1. Senha digitada está errada');
      console.log('   2. Senha foi alterada recentemente');
      console.log('   3. Hash da senha pode estar corrompido');
      console.log('\n💡 Quer resetar a senha? Execute:');
      console.log(`   node backend/reset-password.js ${email} novasenha`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
