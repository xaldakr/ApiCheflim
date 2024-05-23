import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/obtenerfav", async (req, res) => {
  try {
    const detallefav = await prisma.favoritos.findMany();
    res.status(200).json(detallefav);
  } catch (error) {
    console.error("Error al obtener los detalles de favoritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/obtenerfavid/:id/:iduser", async (req, res) => {
  const { id, iduser } = req.params;

  try {
    const favoritoExistente = await prisma.favoritos.findMany({
      where: {
        id_receta: parseInt(id),
        id_usuario: parseInt(iduser),
      },
    });

    if (favoritoExistente.length > 0) {
      res.status(200).json({ existe: 1 });
    } else {
      res.status(200).json({ existe: 2 });
    }
  } catch (error) {
    console.error("Error al consultar favoritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/addfav", async (req, res) => {
  const { idUsuario, idReceta } = req.body;

  console.log(req.body);

  try {
    const favoritoExistente = await prisma.favoritos.findFirst({
      where: {
        id_usuario: parseInt(idUsuario),
        id_receta: parseInt(idReceta),
      },
    });

    if (favoritoExistente) {
      await prisma.favoritos.delete({
        where: {
          id_favorito: parseInt(favoritoExistente.id_favorito),
        },
      });
      return res.status(202).json({ mensaje: "Receta eliminada de favoritos" });
    }

    const ultimoOrden = await prisma.favoritos.findFirst({
      where: {
        id_usuario: parseInt(idUsuario),
      },
      orderBy: {
        orden: "desc",
      },
      select: {
        orden: true,
      },
    });

    const nuevoOrden = ultimoOrden ? ultimoOrden.orden + 1 : 1;

    await prisma.favoritos.create({
      data: {
        id_usuario: parseInt(idUsuario),
        id_receta: parseInt(idReceta),
        orden: nuevoOrden,
      },
    });

    res.status(201).json({ mensaje: "Receta agregada a favoritos" });
  } catch (error) {
    console.error("Error al agregar receta a favoritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/eliminarfav/:idf", async (req, res) => {
  const { idf } = req.params;

  try {
    await prisma.favoritos.delete({
      where: {
        id_favorito: parseInt(idf),
      },
    });

    res.status(200).json({ mensaje: "Receta eliminada de favoritos" });
  } catch (error) {
    console.error("Error al eliminar receta de favoritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/resena", async (req, res) => {
  const { id_usuario, id_receta, valor } = req.body;

  if (valor < 1 || valor > 5) {
    return res
      .status(400)
      .json({ mensaje: "El valor debe estar entre 1 y 5." });
  }

  try {
    console.log(req.body);
    const existenteResena = await prisma.resena.findFirst({
      where: {
        id_usuario: id_usuario,
        id_receta: id_receta,
      },
    });

    if (existenteResena) {
      console.log("Error aqui", existenteResena.id_resena);
      await prisma.resena.update({
        where: {
          id_resena: existenteResena.id_resena,
        },
        data: {
          valor: valor,
        },
      });
      return res
        .status(200)
        .json({ mensaje: "Reseña actualizada", valor: valor });
    } else {
      await prisma.resena.create({
        data: {
          id_usuario: id_usuario,
          id_receta: id_receta,
          valor: valor,
        },
      });
      return res.status(201).json({ mensaje: "Reseña creada", valor: valor });
    }
  } catch (error) {
    console.error("Error en la gestión de reseñas: ", error);
    res.status(500).json({ mensaje: "Error al procesar la reseña." });
  }
});

export default router;
