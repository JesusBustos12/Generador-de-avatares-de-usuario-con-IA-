//Dependencias:
import axios from "axios";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Integridad de las variables de entorno:
dotenv.config();

//Configurar el servidor:
const app = express();
const port = process.env.PORT || 3000;

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

//Peticion post:
//Peticion post protegida con rate limit en memoria
app.post("/api/gen-img", limiter, async(req, res) => {

    const apiKey = process.env.OPENAI_API_KEY;
    const {category} = req.body;

    // Validación estricta de inputs por seguridad
    const validCategories = ["hombre", "mujer", "niño", "anciano", "animal"];
    if (!validCategories.includes(category?.toLowerCase())) {
        return res.status(400).json({ error: "Categoría no válida." });
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
        // Usamos DALL-E 3 para resultados de máxima calidad Premium
        const endPoint = await axios.post("https://api.openai.com/v1/images/generations", {
            model: "dall-e-3",
            prompt: context,
            n: 1,
            size: "1024x1024" // DALL-E 3 requiere min 1024x1024
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const imageUrl = endPoint.data.data[0].url;

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


