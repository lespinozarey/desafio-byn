import jimp from 'jimp';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from 'express';


const app = express();

app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});


//DEJAR PUBLICA LA CARPETA PUBLIC
app.use(express.static("public"));

//PROCESAR DATOS JSON Y GUARDARLOS EN req.body
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./public/index.html"));
});

app.post("/process-image", async (req, res) => {
    try {
        let { imagen } = req.body;
        if (!imagen) {
            return res.status(400).json({
                message: "Error: debe enviar la URL de la imagen."
            });
        }

        let nuevoNombre = await procesarImagen(imagen);

        res.redirect(`/image/${nuevoNombre}`);

    } catch (error) {
        res.status(500).send("Error en proceso de guardar la imagen");
    }
});

app.get("/image/:nombre", (req, res) => {
    let nombre = req.params.nombre;
    res.sendFile(path.resolve(__dirname, "./public/image.html"));
});

app.post("/api/image/upload", async (req, res) => {
    try {
        let { imagen } = req.body;
        if (!imagen) {
            return res.status(400).json({
                message: "Error: debe enviar la URL de la imagen."
            });
        }

        let nuevoNombre = await procesarImagen(imagen);

        res.status(201).json({
            message: nuevoNombre
        });

    } catch (error) {
        res.status(500).send("Error en proceso de guardar la imagen");
    }
});

const procesarImagen = (ruta) => {
    return new Promise((resolve, reject) => {
        jimp.read(ruta, async (error, imagen) => {
            if (error) {
                reject("Error al leer la imagen.");
            }

            let uuid = uuidv4().split('-')[0];
            let nuevoNombre = `${uuid}.jpg`;
            let rutaImagen = path.resolve(__dirname, `./public/storage/${nuevoNombre}`);

            imagen
                .resize(350, jimp.AUTO)
                .quality(100)
                .greyscale()
                .write(rutaImagen, (err) => {
                    if (err) {
                        reject("Error al guardar la imagen.");
                    } else {
                        resolve(nuevoNombre);
                    }
                });
        });
    });
}