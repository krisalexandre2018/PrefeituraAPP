const fs = require('fs');
const path = require('path');

// Criar SVG simples para cada asset
const createIcon = (size, text) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;

const assetsDir = path.join(__dirname, 'assets');

// Criar diretório se não existir
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Criar SVG temporário
const iconSvg = createIcon(1024, 'V');
const splashSvg = createIcon(2048, 'Vereadores');
const faviconSvg = createIcon(48, 'V');

// Como não temos Sharp ou Canvas, vamos criar um PNG básico usando o pacote @resvg/resvg-js
console.log('⚠️  Para converter SVG para PNG, instale: npm install @resvg/resvg-js');
console.log('Por enquanto, vamos criar arquivos SVG como placeholders.');

// Salvar SVGs
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSvg);

console.log('✅ SVG placeholders criados em:', assetsDir);
console.log('\nVocê pode:');
console.log('1. Converter para PNG usando uma ferramenta online');
console.log('2. Usar as imagens default do Expo (recomendado para desenvolvimento)');
console.log('3. Criar suas próprias imagens personalizadas');
