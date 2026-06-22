//Dependencias:
import axios from "axios";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Integridad de las variables de entorno:
dotenv.config();

//Configurar base de datos TiDB:
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true
    }
});
const MAX_GENERATIONS = 5;

//Configurar el servidor:
const app = express();
const port = process.env.PORT || 3000;

// Habilitar trust proxy para que funcione correctamente en Vercel
app.set('trust proxy', 1);

// Configurar Seguridad (Base de datos en memoria)
app.use(helmet());
app.use(cors());

// Limitar peticiones a 3 por IP para proteger la API Key
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 5, // Limite de 5 peticiones por IP
    message: { error: "Has alcanzado el límite máximo de 5 avatares por dispositivo." }
});

//Servir el front-end usando ruta absoluta:
app.use("/", express.static(path.join(__dirname, "public")));

//Middleware:
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Endpoint para migrar localStorage a TiDB
app.post("/api/migrate-local-storage", async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { count } = req.body;

    if (count !== undefined && !isNaN(parseInt(count))) {
        try {
            await pool.query(`
                INSERT INTO user_generations (ip_address, generation_count) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE generation_count = GREATEST(generation_count, ?)
            `, [ip, parseInt(count), parseInt(count)]);
            res.json({ success: true });
        } catch (error) {
            console.error("Error migrating local storage:", error);
            res.status(500).json({ error: "Error interno al migrar" });
        }
    } else {
        res.status(400).json({ error: "Conteo inválido" });
    }
});

// Endpoint para consultar el estado del límite
app.get("/api/limit-status", async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const [rows] = await pool.query('SELECT generation_count, updated_at FROM user_generations WHERE ip_address = ?', [ip]);
        let count = 0;
        if (rows.length > 0) {
            const lastUpdated = new Date(rows[0].updated_at);
            const now = new Date();
            const hoursDiff = Math.abs(now - lastUpdated) / 36e5; // Diferencia en horas

            if (hoursDiff >= 24) {
                // Han pasado 24 horas desde la última generación, se reinicia virtualmente
                count = 0;
            } else {
                count = rows[0].generation_count;
            }
        }
        res.json({ remaining: Math.max(0, MAX_GENERATIONS - count), max: MAX_GENERATIONS });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar límites" });
    }
});

//Peticion post:
//Peticion post protegida con rate limit en memoria
app.post("/api/gen-img", limiter, async (req, res) => {

    const apiKey = process.env.OPENAI_API_KEY;
    const { category } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Validación estricta de inputs por seguridad
    const validCategories = ["hombre", "mujer", "niño", "anciano", "animal"];
    if (!validCategories.includes(category?.toLowerCase())) {
        return res.status(400).json({ error: "Categoría no válida." });
    }

    let shouldReset = false;
    try {
        // Verificar limite en la base de datos
        const [rows] = await pool.query('SELECT generation_count, updated_at FROM user_generations WHERE ip_address = ?', [ip]);
        let currentCount = 0;

        if (rows.length > 0) {
            const lastUpdated = new Date(rows[0].updated_at);
            const now = new Date();
            const hoursDiff = Math.abs(now - lastUpdated) / 36e5;

            if (hoursDiff >= 24) {
                currentCount = 0;
                shouldReset = true;
            } else {
                currentCount = rows[0].generation_count;
            }
        }

        if (currentCount >= MAX_GENERATIONS) {
            return res.status(403).json({ error: "Has alcanzado el límite máximo de 5 avatares por dispositivo." });
        }
    } catch (dbError) {
        console.error("Error al consultar TiDB:", dbError);
        return res.status(500).json({ error: "Error interno del servidor al verificar límites." });
    }

    // Generador de características aleatorias para asegurar diversidad
    const hairColors = ["rubio", "castaño", "negro", "pelirrojo", "blanco", "plateado", "azul oscuro", "rosa pastel"];
    const eyeColors = ["azules", "verdes", "marrones", "avellana", "grises", "ámbar", "violetas"];
    const skinTones = ["tez clara", "tez morena", "tez pálida", "tez bronceada"];
    const expressions = ["con una sonrisa amable", "con mirada serena", "con expresión alegre", "con actitud heroica", "con una sonrisa pícara", "con mirada cautivadora"];
    const genders = ["masculino", "femenino"];

    const randomHair = hairColors[Math.floor(Math.random() * hairColors.length)];
    const randomEyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
    const randomSkin = skinTones[Math.floor(Math.random() * skinTones.length)];
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];

    let specificTraits = `cabello ${randomHair}, ojos ${randomEyes}, ${randomSkin}, y ${randomExpression}`;

    // Adaptaciones especiales dependiendo de la categoría general
    const catLower = category?.toLowerCase();
    if (catLower === "animal") {
        const animalTypes = ["perro místico", "gato elegante", "zorro astuto", "búho sabio", "panda juguetón", "lobo salvaje", "tigre fiero", "león majestuoso"];
        const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
        specificTraits = `especie: ${randomAnimal}, con pelaje o rasgos muy detallados, y ${randomExpression}`;
    } else if (catLower === "niño" || catLower === "anciano") {
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        specificTraits = `de género ${randomGender}, ${specificTraits}`;
    }

    const context = `
        Eres un experto profesional en ilustración digital, diseño de retratos y caricaturas.
        Tu deber es crear un avatar impresionante de un/una ${category}.
        
        Para garantizar la originalidad y variedad, debes incorporar estrictamente las siguientes características físicas en el diseño:
        - Rasgos obligatorios: ${specificTraits}.
        
        Especificaciones de estilo y encuadre:
        - Estilos permitidos: "Anime de alta calidad", "Retrato digital moderno", "Estilo Cartoon Premium", o "Arte Conceptual de Videojuegos".
        - El avatar debe ser un retrato centrado en el rostro y hombros.
        - Composición limpia, colores vibrantes y acabado hiper-detallado.
        - Importante: No sobreponer texto ni otras imágenes. Solo un personaje principal con fondo sutil.
    `;

    try {
        // Usamos gpt-image-1-mini (el modelo económico actual de OpenAI para imágenes)
        const endPoint = await axios.post("https://api.openai.com/v1/images/generations", {
            model: "gpt-image-1-mini",
            prompt: context,
            n: 1,
            size: "1024x1024"
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        // gpt-image-1 devuelve base64 por defecto
        const imageData = endPoint.data.data[0];
        const imageUrl = imageData.url || `data:image/png;base64,${imageData.b64_json}`;

        try {
            if (shouldReset) {
                // Reiniciar el contador porque ya pasaron más de 24 horas
                await pool.query(`
                    UPDATE user_generations 
                    SET generation_count = 1 
                    WHERE ip_address = ?
                `, [ip]);
            } else {
                // Incrementar contador en TiDB
                await pool.query(`
                    INSERT INTO user_generations (ip_address, generation_count) 
                    VALUES (?, 1) 
                    ON DUPLICATE KEY UPDATE generation_count = generation_count + 1
                `, [ip]);
            }
        } catch (dbError) {
            console.error("Error al actualizar limite en TiDB:", dbError);
        }

        return res.status(200).json({
            image: imageUrl
        });

    } catch (exception) {
        console.error("Error OpenAI:", exception.response ? exception.response.data : exception.message);
        return res.status(500).json({
            error: "Error al generar la imagen. Por favor intenta de nuevo más tarde."
        });
    }

});

app.listen(port, () => {
    console.log(`Tu servidor esta iniciando en: http://localhost:${port}`);
});


