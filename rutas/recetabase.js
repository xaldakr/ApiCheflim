import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/receta", async (req, res) => {
  const { nombre } = req.query;

  try {
    let detalles;

    if (nombre) {
      detalles = await prisma.recetas.findMany({
        where: {
          OR: [
            { descripcion: { contains: nombre, mode: "insensitive" } },
            { Usuarios: { nombre: { contains: nombre, mode: "insensitive" } } },
          ],
        },
        include: {
          Ingredientes: true,
          Usuarios: { select: { nombre: true } },
          Resena: true,
        },
        take: 30,
      });
    } else {
      detalles = await prisma.recetas.findMany({
        include: {
          Ingredientes: true,
          Usuarios: { select: { nombre: true } },
          Resena: true,
        },
        take: 30,
      });
    }

    detalles.forEach((receta) => {
      if (receta.Resena.length > 0) {
        const totalResenas = receta.Resena.length;
        const sumResenas = receta.Resena.reduce(
          (sum, resena) => sum + resena.valor,
          0
        );
        receta.promedioResenas = sumResenas / totalResenas;
        receta.cantidadResenas = totalResenas;
      } else {
        receta.promedioResenas = 0;
        receta.cantidadResenas = 0;
      }
    });

    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener los detalles de la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/receta/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let detalles;

    if (id) {
      detalles = await prisma.favoritos.findMany({
        where: {
          id_usuario: parseInt(id),
        },
        include: {
          Recetas: {
            include: {
              Ingredientes: true,
              Usuarios: { select: { nombre: true } },
              Resena: { select: { valor: true } },
            },
          },
        },
        take: 30,
      });

      detalles = detalles.map((fav) => fav.Recetas);
    }

    detalles.forEach((receta) => {
      if (receta.Resena.length > 0) {
        const totalResenas = receta.Resena.length;
        const sumResenas = receta.Resena.reduce(
          (sum, resena) => sum + resena.valor,
          0
        );
        receta.promedioResenas = sumResenas / totalResenas;
        receta.cantidadResenas = totalResenas;
      } else {
        receta.promedioResenas = 0;
        receta.cantidadResenas = 0;
      }
    });

    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener los detalles de la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
