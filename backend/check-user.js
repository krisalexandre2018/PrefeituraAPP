const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'kris.alexandre2018@gmail.com';
    const senhaParaTestar = '123456';

    console.log('🔍 Verificando usuário...\n');

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        tipo: true,
        status: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    console.log('✅ Usuário encontrado:\n');
    console.log('━'.repeat(80));
    console.log(`Nome:   ${user.nome}`);
    console.log(`Email:  ${user.email}`);
    console.log(`Tipo:   ${user.tipo}`);
    console.log(`Status: ${user.status}`);
    console.log('━'.repeat(80));
    console.log(`\n🔐 Hash da senha no banco:`);
    console.log(user.senha);
    console.log('\n🧪 Testando senha "123456"...');

    const isValid = await bcrypt.compare(senhaParaTestar, user.senha);

    if (isValid) {
      console.log('✅ Senha CORRETA! A senha "123456" funciona.');
    } else {
      console.log('❌ Senha INCORRETA! A senha "123456" NÃO funciona.');
      console.log('\n💡 Vou criar uma nova senha agora...');

      const novoHash = await bcrypt.hash(senhaParaTestar, 10);
      await prisma.user.update({
        where: { email },
        data: { senha: novoHash }
      });

      console.log('✅ Nova senha configurada com sucesso!');
      console.log('   Senha: 123456');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
