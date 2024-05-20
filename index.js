import express from "express";
import cors from "cors";
import lista from "./rutas/lista.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api", lista);

app.listen(PORT, () => {
  console.log(`App lista y perfecta corriendo en el puerto ${PORT}`);
});
