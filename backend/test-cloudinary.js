require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('========================================');
console.log('  TESTE DE CREDENCIAIS CLOUDINARY');
console.log('========================================\n');

// 1. Verificar se variáveis de ambiente estão carregadas
console.log('1. Verificando variáveis de ambiente (.env):\n');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NÃO ENCONTRADO');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ NÃO ENCONTRADO');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ?
  `${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}... (${process.env.CLOUDINARY_API_SECRET.length} caracteres)` :
  '❌ NÃO ENCONTRADO');
console.log('');

// 2. Verificar se há espaços ou aspas
console.log('2. Verificando formatação (espaços/aspas indesejados):\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const hasSpacesCloudName = cloudName !== cloudName.trim();
const hasSpacesApiKey = apiKey !== apiKey.trim();
const hasSpacesApiSecret = apiSecret !== apiSecret.trim();

const hasQuotesCloudName = cloudName.includes('"') || cloudName.includes("'");
const hasQuotesApiKey = apiKey.includes('"') || apiKey.includes("'");
const hasQuotesApiSecret = apiSecret.includes('"') || apiSecret.includes("'");

console.log('   Cloud Name:', hasSpacesCloudName || hasQuotesCloudName ? '❌ TEM ESPAÇOS OU ASPAS' : '✅ OK');
console.log('   API Key:', hasSpacesApiKey || hasQuotesApiKey ? '❌ TEM ESPAÇOS OU ASPAS' : '✅ OK');
console.log('   API Secret:', hasSpacesApiSecret || hasQuotesApiSecret ? '❌ TEM ESPAÇOS OU ASPAS' : '✅ OK');
console.log('');

// 3. Configurar Cloudinary
console.log('3. Configurando Cloudinary SDK:\n');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('   ✅ SDK configurado\n');

// 4. Testar conexão com Cloudinary (ping)
console.log('4. Testando conexão com Cloudinary (API ping):\n');

async function testCloudinary() {
  try {
    // Tentar listar recursos (isso valida as credenciais)
    const result = await cloudinary.api.resources({
      max_results: 1,
      resource_type: 'image'
    });

    console.log('   ✅ SUCESSO! Credenciais estão corretas!');
    console.log('   Recursos encontrados:', result.resources.length);
    console.log('');

    console.log('========================================');
    console.log('  RESULTADO: ✅ CLOUDINARY CONFIGURADO');
    console.log('========================================');

  } catch (error) {
    console.log('   ❌ ERRO! Credenciais inválidas!');
    console.log('');
    console.log('   Detalhes do erro:');
    console.log('   -', error.message);
    if (error.error && error.error.message) {
      console.log('   -', error.error.message);
    }
    console.log('');

    console.log('========================================');
    console.log('  RESULTADO: ❌ FALHA NA CONFIGURAÇÃO');
    console.log('========================================');
    console.log('');
    console.log('🔧 SOLUÇÃO:');
    console.log('');
    console.log('1. Acesse o Cloudinary Dashboard:');
    console.log('   https://cloudinary.com/console');
    console.log('');
    console.log('2. Na página inicial, copie as credenciais EXATAS:');
    console.log('   - Cloud name');
    console.log('   - API Key');
    console.log('   - API Secret (clique em "Reveal API Secret")');
    console.log('');
    console.log('3. Cole no arquivo backend\\.env SEM ASPAS:');
    console.log('   CLOUDINARY_CLOUD_NAME=seu_cloud_name');
    console.log('   CLOUDINARY_API_KEY=sua_api_key');
    console.log('   CLOUDINARY_API_SECRET=seu_api_secret');
    console.log('');
    console.log('4. Reinicie o backend:');
    console.log('   - Pressione Ctrl+C no terminal do backend');
    console.log('   - Execute: npm run dev');
    console.log('');
    console.log('5. Execute este teste novamente:');
    console.log('   node test-cloudinary.js');
    console.log('');

    process.exit(1);
  }
}

// Executar teste
testCloudinary();
