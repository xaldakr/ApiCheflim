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

router.get("/recetafav/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id);

    let detalles = await prisma.favoritos.findMany({
      where: {
        id_usuario: userId,
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
    if (detalles.length === 0) {
      return res.status(404).json({ mensaje: "Usuario sin recetas favoritas" });
    }
    detalles = detalles.map((fav) => fav.Recetas);
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

router.get("/recetauser/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id);
    const recetasDelUsuario = await prisma.recetas.findMany({
      where: {
        id_usuario: userId,
      },
      include: {
        Ingredientes: true,
        Usuarios: { select: { nombre: true } },
        Resena: { select: { valor: true } },
      },
      take: 30,
    });

    if (recetasDelUsuario.length === 0) {
      return res.status(404).json({ mensaje: "Usuario sin recetas" });
    }

    recetasDelUsuario.forEach((receta) => {
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

    res.status(200).json(recetasDelUsuario);
  } catch (error) {
    console.error("Error al obtener los detalles de la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/recetadetalle/:userId/:recetaId", async (req, res) => {
  const { userId, recetaId } = req.params;

  try {
    const userIdInt = parseInt(userId);
    const recetaIdInt = parseInt(recetaId);

    const receta = await prisma.recetas.findUnique({
      where: { id_receta: recetaIdInt },
      include: {
        Ingredientes: true,
        Usuarios: { select: { nombre: true } },
        Resena: {
          where: { id_usuario: userIdInt },
          select: { valor: true },
        },
        Pasos: {
          orderBy: {
            orden: "asc",
          },
        },
      },
    });

    if (!receta) {
      return res.status(404).json({ mensaje: "Receta no encontrada" });
    }
    const favorito = await prisma.favoritos.findFirst({
      where: {
        id_usuario: userIdInt,
        id_receta: recetaIdInt,
      },
    });

    const isFavorito = !!favorito;

    let userResena = 0;
    if (receta.Resena.length > 0) {
      userResena = receta.Resena[0].valor;
    }
    delete receta.Resena;

    const recetaDetalle = {
      ...receta,
      isFavorito,
      userResena,
    };

    res.status(200).json(recetaDetalle);
  } catch (error) {
    console.error("Error al obtener los detalles de la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/createreceta", async (req, res) => {
  if (!req.body.img) {
    req.body.img = "";
  }
  const { ingredientes, pasos, id_receta, ...resto } = req.body;

  try {
    const newReceta = await prisma.recetas.create({
      data: {
        ...resto,
      },
    });

    const recetaId = newReceta.id_receta;
    await Promise.all(
      ingredientes.map(async (ingrediente) => {
        await prisma.ingredientes.create({
          data: {
            id_receta: parseInt(recetaId),
            ingrediente: ingrediente.nombre,
          },
        });
      })
    );

    await Promise.all(
      pasos.map(async (paso) => {
        await prisma.pasos.create({
          data: {
            id_receta: parseInt(recetaId),
            paso: paso.descripcion,
            orden: parseInt(paso.orden),
          },
        });
      })
    );

    res.status(201).json({ id_receta: parseInt(recetaId) });
  } catch (error) {
    console.error("Error al crear la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/updatereceta/:id", async (req, res) => {
  const { id } = req.params;
  const { ingredientes, pasos, ...resto } = req.body;

  try {
    const recetaId = parseInt(id);

    await prisma.ingredientes.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    await prisma.pasos.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    const updatedReceta = await prisma.recetas.update({
      where: {
        id_receta: recetaId,
      },
      data: {
        ...resto,
      },
    });

    await Promise.all(
      ingredientes.map(async (ingrediente) => {
        await prisma.ingredientes.create({
          data: {
            id_receta: recetaId,
            ingrediente: ingrediente.nombre,
          },
        });
      })
    );
    await Promise.all(
      pasos.map(async (paso) => {
        await prisma.pasos.create({
          data: {
            id_receta: recetaId,
            paso: paso.descripcion,
            orden: paso.orden,
          },
        });
      })
    );

    res
      .status(200)
      .json({ mensaje: "Receta actualizada con éxito", id_receta: recetaId });
  } catch (error) {
    console.error("Error al actualizar la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/deletereceta/:id", async (req, res) => {
  const { id } = req.params;
  const { ingredientes, pasos, ...resto } = req.body;

  try {
    const recetaId = parseInt(id);

    await prisma.favoritos.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    await prisma.recetas.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    await prisma.ingredientes.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    await prisma.pasos.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    await prisma.recetas.deleteMany({
      where: {
        id_receta: recetaId,
      },
    });

    res
      .status(200)
      .json({ mensaje: "Receta eliminada con éxito", id_receta: recetaId });
  } catch (error) {
    console.error("Error al actualizar la receta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
