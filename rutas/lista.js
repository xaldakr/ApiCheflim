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

router.get("/obtenerlista/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const detalleLista = await prisma.listas.findMany({
      where: {
        id_usuario: parseInt(idUsuario),
      },
    });

    res.status(200).json(detalleLista);
  } catch (error) {
    console.error("Error al obtener los detalles de la lista:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
