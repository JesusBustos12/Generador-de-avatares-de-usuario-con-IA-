//Dependencias:
import axios from "axios";
import express from "express";
import dotenv from "dotenv";

//Integridad de las variables de entorno:
dotenv.config();

//Configurar el servidor:
const app = express();
const port = process.env.PORT || 3000;

//Servir el front-end:
app.use("/", express.static("public"));

//Middleware:
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Peticion post:
app.post("/api/gen-img", async(req, res) => {

    const apiKey = process.env.OPENAI_API_KEY;

    const {category} = req.body;

    const context = `
        Heres un experto en dibujo y diseño de retratos y caricaturas.
        Tu deber es realizar imagenes para el avatar del ${category}.
            Especificasiones:
                - dimenciones del avatar: 256x256 pixeles.
                - Forma de la imagen: Rectangular o cuadrada.
                - Tematicas o estilos del ${category}: "Anime", "dibujos de los 80", "Cartoon", "Comics de super heroes".
                - Importante: Solo quiero retratos o caricaturas del ${category} con los estilos antes mencionados. Ademas de no sobreponer imagenes por en-sima de la otra.
        Si no sigues todas las especificasiones al momento de realizar el avatar de ${category}. Seras despedido de la empresa como castigo 😡.
    `;

    try{

        const endPoint = await axios.post("https://api.openai.com/v1/images/generations", {
            model: "dall-e-2",
            prompt: context,
            n: 1,
            size: "256x256"
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
        return res.status(500).json({
            exception: "Error con el servidor."
        });
    }

});

app.listen(port, () => {
    console.log(`Tu servidor esta iniciando en: http://localhost${port}`);
});


