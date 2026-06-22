# Generador de Avatares Premium con IA

## Descripción
Aplicación web full-stack diseñada para la generación instantánea de avatares únicos impulsados por Inteligencia Artificial (OpenAI API). El usuario puede seleccionar una categoría (Hombre, Mujer, Niño, Anciano, Animal) y el sistema interactúa con el modelo avanzado para retornar retratos hiper-detallados, centralizados en el rostro y hombros, garantizando composiciones limpias en alta resolución (1024x1024).

## Arquitectura y Tecnologías
- **Backend:** Node.js, Express
- **Base de Datos:** TiDB (MySQL Serverless)
- **Frontend:** Vanilla JavaScript, HTML5 Semántico, CSS3 Puro
- **Integraciones:** OpenAI API
- **Seguridad:** `helmet`, `cors`, `express-rate-limit`, `dotenv`

## Características Principales
- **Generador de Variabilidad Orgánica:** El backend incluye un motor de "Prompt Engineering" que inyecta aleatoriamente cientos de combinaciones posibles de rasgos físicos (cabello, ojos, piel, expresiones, géneros y razas de animales) por debajo de la mesa. Esto asegura que la IA devuelva un personaje 100% distinto y único cada vez, mitigando por completo la repetición o "sesgo de default".
- **Generación de Alta Fidelidad Eficiente:** Conectado al moderno modelo `gpt-image-1-mini` de OpenAI, equilibrando magistralmente una calidad gráfica premium ("Anime", "Arte Conceptual") con un costo fraccionario por imagen, haciéndolo viable para producción escalable.
- **Control de Acceso y Rate Limiting en DB:** Arquitectura de seguridad por IP alojada en TiDB. Bloquea vulnerabilidades de alteración de "Clear Data" del navegador, garantizando que el límite de 5 avatares por dispositivo sea impenetrable desde el frontend.
- **Restablecimiento Automático Temporizado:** Lógica matemática en el servidor que reabastece silenciosamente las 5 peticiones del usuario exactamente al cumplirse 24 horas de inactividad, en perfecta sincronía.
- **Optimización SEO:** El proyecto incluye metaetiquetas avanzadas, etiquetas Open Graph (`og:`) para previsualizaciones en redes sociales, y un esquema HTML5 semántico.
- **Experiencia de Usuario (UX) Premium:** UI inmersiva con tema oscuro y acentos neón, barra dinámica de cupo, descargas instantáneas ultra-rápidas extrayendo Base64 directo a DOM (bypassing CSP restrictions), y notificaciones flotantes animadas (Toast).

## Estructura del Proyecto
text
/
├── app.js                    # Servidor Express, endpoints REST, integración OpenAI y DB
├── database.sql              # Esquema SQL para control de acceso (user_generations)
├── package.json              # Dependencias
├── .env                      # Variables de entorno (API Keys, URI DB)
├── public/
│   ├── index.html            # Interfaz de la aplicación (UI)
│   ├── Assets/
│   │   ├── CSS/styles.css    # Diseño y UI responsivo
│   │   └── JS/main.js        # Consumo de API RESTful y control del DOM

## Enlace del proyecto desplegado:
https://generador-de-avatares-de-usuario-co.vercel.app/

## Contacto
- **GitHub:** [JesusBustos12](https://github.com/JesusBustos12)
- **LinkedIn:** [Jesus Bustos Arizmendi](https://linkedin.com/in/jesus-bustos-arizmendi-325329283)
- **Email:** jesusbustosarizmendi0@gmail.com