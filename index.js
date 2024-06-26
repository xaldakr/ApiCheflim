import express from "express";
import cors from "cors";
import lista from "./rutas/lista.js";
import favoritos from "./rutas/favoritos.js";
import login from "./rutas/login.js";
import recetas from "./rutas/recetabase.js";
import imag from "./rutas/imag.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api", lista);
app.use("/api", favoritos);
app.use("/api", login);
app.use("/api", recetas);
app.use("/api", imag);

app.listen(PORT, () => {
  console.log(`App lista y perfecta corriendo en el puerto ${PORT}`);
});
