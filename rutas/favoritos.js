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
  router.post("/addfav", async (req, res) => {
    const { idUsuario, idReceta } = req.body;

    try {

        const favoritoExistente = await prisma.favoritos.findFirst({
            where: {
                id_usuario: parseInt(idUsuario),
                id_receta: parseInt(idReceta)
            }
        });

        if (favoritoExistente) {

            await prisma.favoritos.delete({
                where: {
                    id_favorito: favoritoExistente.id_favorito
                }
            });
            res.status(200).json({ mensaje: "La receta se eliminó de favoritos" });
        } else {

            const ultimoOrden = await prisma.favoritos.findFirst({
                where: {
                    id_usuario: parseInt(idUsuario)
                },
                orderBy: {
                    orden: 'desc'
                },
                select: {
                    orden: true
                }
            });
        
            const nuevoOrden = ultimoOrden ? ultimoOrden.orden + 1 : 1;
        
            await prisma.favoritos.create({
                data: {
                    id_usuario: parseInt(idUsuario),
                    id_receta: parseInt(idReceta),
                    orden: nuevoOrden
                }
            });
            res.status(201).json({ mensaje: "Receta agregada a favoritos" });
        }
        
    } catch (error) {
        console.error("Error al agregar/recuperar receta de favoritos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


export default router;