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
- **Generación de Imágenes de Alta Calidad:** Conexión directa a OpenAI para obtener resultados con estilos premium (Anime de alta calidad, Retrato digital moderno, Arte Conceptual).
- **Control de Acceso y Rate Limiting Seguro:** Implementación de una arquitectura de seguridad por IP alojada en base de datos. Mitiga vulnerabilidades de tipo "Clear Data" en el navegador para garantizar que las cuotas de generación (3 peticiones por dispositivo) sean controladas y respetadas a nivel backend. 
- **Restablecimiento Automático:** Lógica temporal en base de datos que reabastece las peticiones del usuario de forma transparente tras 24 horas.
- **Optimización SEO:** El proyecto incluye metaetiquetas avanzadas, etiquetas Open Graph (`og:`) para previsualizaciones en redes sociales, y un esquema de HTML5 semántico (`<main>`, `<section>`, etc.) para un indexado óptimo.
- **Interfaz de Usuario y UX:** Diseño moderno, minimalista, y completamente responsivo. Implementa feedback visual, descargas automáticas y animaciones de progreso consultadas de manera síncrona con la base de datos.
- **Validaciones Estrictas:** Validaciones a nivel servidor y cliente para asegurar un uso estructurado del API y evitar inyecciones maliciosas.

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