import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/obtenerlista", async (req, res) => {
  try {
    const detallelista = await prisma.listas.findMany();
    res.status(200).json(detallelista);
  } catch (error) {
    console.error("Error al obtener los detalles de la lista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/obtenerlista/:id", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const detalleLista = await prisma.listas.findMany({
      where: {
        id_usuario: parseInt(idUsuario),
      },
    });

    if (detalleLista.length === 0) {
      return res.status(404).json({ error: "No se han encontrado datos" });
    }

    res.status(200).json(detalleLista);
  } catch (error) {
    console.error("Error al obtener los detalles de la lista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/anadirlista", async (req, res) => {
  const { id_usuario, id_receta } = req.body;
  try {
    const recetaobtenida = await prisma.recetas.findUnique({
      where: {
        id_receta: id_receta,
      },
      include: {
        Ingredientes: true,
      },
    });
    if (!recetaobtenida) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    const listaUsuario = await prisma.listas.findMany({
      where: {
        id_usuario: parseInt(id_usuario),
      },
    });

    const itemsUsuario = new Set(listaUsuario.map((item) => item.item));

    const ingredientesFiltrados = recetaobtenida.Ingredientes.filter(
      (ingrediente) => !itemsUsuario.has(ingrediente.ingrediente)
    );

    const nuevaListaItems = [];
    for (const ingrediente of ingredientesFiltrados) {
      const nuevoItem = await prisma.listas.create({
        data: {
          id_usuario: id_usuario,
          item: ingrediente.ingrediente,
        },
      });
      nuevaListaItems.push(nuevoItem);
    }

    const listarecetaFiltrada = {
      ...recetaobtenida,
      Ingredientes: ingredientesFiltrados,
    };

    res.status(200).json({
      mensaje:
        "Ingredientes mandados correctamente a la lista de compras del usuario",
      receta: listarecetaFiltrada,
      lista: nuevaListaItems,
    });
  } catch (error) {
    console.error("Error al añadir la receta a la lista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/eliminaritem/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteResult = await prisma.listas.delete({
      where: {
        id_lista: parseInt(id),
      },
    });

    if (deleteResult.count === 1) {
      res.status(200).json({ mensaje: "Elemento eliminado correctamente" });
    } else {
      res
        .status(404)
        .json({ error: "El elemento no se encontró para eliminar" });
    }
  } catch (error) {
    console.error("Error al borrar el elemento de la lista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
