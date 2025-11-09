const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createVereador() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.user.create({
      data: {
        nome: 'João Vereador',
        cpf: '12345678901',
        email: 'vereador@teste.com',
        senha: hashedPassword,
        tipo: 'VEREADOR',
        status: 'ATIVO',
        telefone: '11999998888'
      }
    });

    console.log('\n✅ Usuário VEREADOR criado com sucesso!\n');
    console.log('Credenciais para login:');
    console.log('Email: vereador@teste.com');
    console.log('Senha: 123456');
    console.log('\nDados do usuário:');
    console.log(JSON.stringify({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      status: user.status,
      telefone: user.telefone
    }, null, 2));
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Erro: Email ou CPF já cadastrado!');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createVereador();
