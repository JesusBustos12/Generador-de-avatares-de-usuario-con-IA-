import fs from 'fs';

const src = 'C:\\Users\\52762\\.gemini\\antigravity-ide\\brain\\a16b7e9f-4db0-4e74-9f82-d3171787b546\\premium_ai_logo_1781155758299.png';
const dest = 'c:\\IDEs - Lenguajes de Programacion\\IDEs\\(Portafolio)\\(Desarrollo web con IA)\\Avatares OpenAI\\public\\Assets\\Imgs\\premium_ai_logo.png';

try {
    fs.copyFileSync(src, dest);
    console.log('Copiado exitosamente con Node!');
} catch (e) {
    console.error('Error al copiar con Node:', e.message);
}
