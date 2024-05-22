import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PrismaClient } from "@prisma/client";
import exp from "constants";

const router = Router();
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// configuration to store the image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../media"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/subir/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { filename } = req.file;
  const imageUrl = `${filename}`;

  try {
    const recetaActualizada = await prisma.recetas.update({
      where: {
        id_receta: parseInt(id),
      },
      data: {
        img: imageUrl,
      },
    });

    if (recetaActualizada) {
      res.json({ mensaje: "Imagen subida existosamente", imageUrl });
    } else {
      res.status(404).json({ error: "Receta no encontrada" });
    }
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/resubir/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { filename } = req.file;
  const imageUrl = `${filename}`;

  try {
    // Obtener la receta para obtener la imagen anterior
    const recetaAnterior = await prisma.recetas.findUnique({
      where: {
        id_receta: parseInt(id),
      },
    });

    if (!recetaAnterior) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    // Eliminar la imagen anterior si existe
    const imagenAnterior = recetaAnterior.img;
    if (imagenAnterior) {
      fs.unlinkSync(path.join(__dirname, imagenAnterior));
    }

    // Actualizar la receta con la nueva imagen
    const recetaActualizada = await prisma.recetas.update({
      where: {
        id_receta: parseInt(id),
      },
      data: {
        img: imageUrl,
      },
    });

    res.json({ mensaje: "Imagen resubida existosamente", imageUrl });
  } catch (error) {
    console.error("Error al resubir la imagen:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/borrarArchivo/:idReceta", async (req, res) => {
  const { idReceta } = req.params;

  try {
    const receta = await prisma.recetas.findUnique({
      where: {
        id_receta: parseInt(idReceta),
      },
    });

    if (!receta) {
      return res.status(404).json({
        error: `No se encontró ninguna receta con el ID '${idReceta}'`,
      });
    }

    const nombreArchivo = receta.img;

    const rutaArchivo = path.join(__dirname, nombreArchivo);

    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
      console.log(
        `Archivo asociado a la receta con ID '${idReceta}' borrado exitosamente`
      );
      res.json({
        mensaje: `Archivo asociado a la receta con ID '${idReceta}' borrado exitosamente`,
      });
    } else {
      console.log(
        `El archivo asociado a la receta con ID '${idReceta}' no existe`
      );
      res.status(404).json({
        error: `El archivo asociado a la receta con ID '${idReceta}' no existe`,
      });
    }
  } catch (error) {
    console.error(
      `Error al borrar el archivo asociado a la receta con ID '${idReceta}':`,
      error
    );
    res.status(500).json({
      error: `Error al borrar el archivo asociado a la receta con ID '${idReceta}'`,
    });
  }
});

router.get("/obtenerimg/:filename", (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, "../media", filename);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send("La imagen no existe");
  }
});

export default router;
