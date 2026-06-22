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
const MAX_GENERATIONS = 3;

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
    max: 3, // Limite de 3 peticiones por IP
    message: { error: "Has alcanzado el límite máximo de 3 avatares por dispositivo." }
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
app.post("/api/gen-img", limiter, async(req, res) => {

    const apiKey = process.env.OPENAI_API_KEY;
    const {category} = req.body;
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
            return res.status(403).json({ error: "Has alcanzado el límite máximo de 3 avatares por dispositivo." });
        }
    } catch (dbError) {
        console.error("Error al consultar TiDB:", dbError);
        return res.status(500).json({ error: "Error interno del servidor al verificar límites." });
    }

    const context = `
        Eres un experto profesional en ilustración digital, diseño de retratos y caricaturas.
        Tu deber es crear un avatar impresionante de un/una ${category}.
        
        Especificaciones obligatorias:
        - Estilos permitidos: "Anime de alta calidad", "Retrato digital moderno", "Estilo Cartoon Premium", o "Arte Conceptual de Videojuegos".
        - El avatar debe ser un retrato centrado en el rostro y hombros.
        - Composición limpia, colores vibrantes y acabado hiper-detallado.
        - Importante: No sobreponer texto ni otras imágenes. Solo un personaje principal con fondo sutil.
    `;

    try{
        // Usamos gpt-image-1 (el modelo actual de OpenAI para imágenes)
        const endPoint = await axios.post("https://api.openai.com/v1/images/generations", {
            model: "gpt-image-1",
            prompt: context,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
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

    }catch(exception){
        console.error("Error OpenAI:", exception.response ? exception.response.data : exception.message);
        return res.status(500).json({
            error: "Error al generar la imagen. Por favor intenta de nuevo más tarde."
        });
    }

});

app.listen(port, () => {
    console.log(`Tu servidor esta iniciando en: http://localhost:${port}`);
});


