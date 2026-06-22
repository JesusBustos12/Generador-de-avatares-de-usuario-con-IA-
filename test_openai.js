import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    const context = `
        Eres un experto profesional en ilustración digital, diseño de retratos y caricaturas.
        Tu deber es crear un avatar impresionante de un/una hombre.
        
        Especificaciones obligatorias:
        - Estilos permitidos: "Anime de alta calidad", "Retrato digital moderno", "Estilo Cartoon Premium", o "Arte Conceptual de Videojuegos".
        - El avatar debe ser un retrato centrado en el rostro y hombros.
        - Composición limpia, colores vibrantes y acabado hiper-detallado.
        - Importante: No sobreponer texto ni otras imágenes. Solo un personaje principal con fondo sutil.
    `;

    try {
        console.log("Haciendo petición a OpenAI...");
        const endPoint = await axios.post("https://api.openai.com/v1/images/generations", {
            model: "gpt-image-1.5",
            prompt: context,
            n: 1,
            size: "1024x1024"
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });
        
        console.log("✅ Éxito! Respuesta de OpenAI:");
        console.log(endPoint.data.data[0]);

    } catch (exception) {
        console.error("❌ Error de OpenAI:");
        if (exception.response) {
            console.error(JSON.stringify(exception.response.data, null, 2));
        } else {
            console.error(exception.message);
        }
    }
}

testOpenAI();
