import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();

router.post("/checkifuser", async (req, res) => {
  try {
    const { correo, nombre, usuario } = req.body;

    const checklogin = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { usuario: usuario },
          {
            correo: correo,
          },
        ],
      },
    });

    const datosjson = { validacion: checklogin ? true : false };
    res.json(datosjson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", datoerror: error });
  }
});

router.post("/createuser", async (req, res) => {
  try {
    const { correo, nombre, usuario, contrasena } = req.body;

    const newlogin = await prisma.usuarios.create({
      data: {
        correo,
        nombre,
        usuario,
        contrasena,
      },
    });
    const datosjson = {
      id_usuario: newlogin.id_usuario,
      correo: newlogin.correo,
      nombre: newlogin.nombre,
      usuario: newlogin.usuario,
    };
    res.json(datosjson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", datoerror: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { contrasena, correo } = await req.body;

    if (!contrasena || !correo) {
      res
        .status(400)
        .json({ error: "No se han mandado correctamente los datos" });
    } else {
      const datologin = await Promise.race([
        prisma.usuarios.findFirst({
          where: {
            correo: correo,
            contrasena: contrasena,
          },
        }),
        new Promise(
          (resolve, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 8000) // Timeout de 8 segundos
        ),
      ]);

      if (datologin !== null) {
        const datosjson = {
          id_usuario: datologin.id_usuario,
          correo: datologin.correo,
          nombre: datologin.nombre,
          usuario: datologin.usuario,
        };
        res.json(datosjson);
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    }
  } catch (error) {
    if (error.message === "Timeout") {
      res.status(500).json({ error: "La solicitud ha expirado" });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", datoerror: error });
    }
  }
});

router.patch("/edituser/:id", async (req, res) => {
  try {
    const { correo, nombre, usuario } = req.body;
    const { id } = req.params;

    const correoExistente = await prisma.usuarios.findFirst({
      where: {
        correo,
        NOT: {
          id_usuario: +id,
        },
      },
    });

    if (correoExistente) {
      return res.status(402).json({ error: "Correo ya existente" });
    }

    const usuarioExistente = await prisma.usuarios.findFirst({
      where: {
        usuario,
        NOT: {
          id_usuario: +id,
        },
      },
    });

    if (usuarioExistente) {
      return res.status(402).json({ error: "Usuario ya existente" });
    }

    const editlogin = await prisma.usuarios.update({
      where: {
        id_usuario: +id,
      },
      data: {
        correo,
        nombre,
        usuario,
      },
    });

    const datosjson = {
      validacion: editlogin ? true : false,
      id_usuario: editlogin.id_usuario,
      correo: editlogin.correo,
      nombre: editlogin.nombre,
      usuario: editlogin.usuario,
    };

    res.json(datosjson);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", datoerror: error });
    }
  }
});

router.patch("/changepass/:id", async (req, res) => {
  try {
    const { contrasena } = req.body;
    const { id } = req.params;
    const editlogin = await prisma.usuarios.update({
      where: {
        id_usuario: +id,
      },
      data: {
        contrasena,
      },
    });

    const datosjson = {
      validacion: editlogin ? true : false,
    };
    res.json(datosjson);
  } catch (error) {
    if (error.code === "P2025") {
      // Error code for record not found
      res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", datoerror: error });
    }
  }
});

export default router;
