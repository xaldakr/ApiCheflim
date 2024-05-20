-- CreateTable
CREATE TABLE "Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "correo" VARCHAR(250) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(300) NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Listas" (
    "id_lista" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "item" VARCHAR(300) NOT NULL,

    CONSTRAINT "Listas_pkey" PRIMARY KEY ("id_lista")
);

-- CreateTable
CREATE TABLE "Recetas" (
    "id_receta" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "porciones" INTEGER NOT NULL,
    "tiempo" INTEGER NOT NULL,
    "video" VARCHAR(300) NOT NULL,
    "img" VARCHAR(300) NOT NULL,

    CONSTRAINT "Recetas_pkey" PRIMARY KEY ("id_receta")
);

-- CreateTable
CREATE TABLE "Ingredientes" (
    "id_ingrediente" SERIAL NOT NULL,
    "id_receta" INTEGER NOT NULL,
    "ingrediente" VARCHAR(300) NOT NULL,

    CONSTRAINT "Ingredientes_pkey" PRIMARY KEY ("id_ingrediente")
);

-- CreateTable
CREATE TABLE "Pasos" (
    "id_paso" SERIAL NOT NULL,
    "id_receta" INTEGER NOT NULL,
    "paso" VARCHAR(300) NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "Pasos_pkey" PRIMARY KEY ("id_paso")
);

-- CreateTable
CREATE TABLE "Favoritos" (
    "id_favorito" SERIAL NOT NULL,
    "id_receta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "Favoritos_pkey" PRIMARY KEY ("id_favorito")
);

-- CreateTable
CREATE TABLE "Resena" (
    "id_resena" SERIAL NOT NULL,
    "id_receta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id_resena")
);

-- AddForeignKey
ALTER TABLE "Listas" ADD CONSTRAINT "Listas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recetas" ADD CONSTRAINT "Recetas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredientes" ADD CONSTRAINT "Ingredientes_id_receta_fkey" FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id_receta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasos" ADD CONSTRAINT "Pasos_id_receta_fkey" FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id_receta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favoritos" ADD CONSTRAINT "Favoritos_id_receta_fkey" FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id_receta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favoritos" ADD CONSTRAINT "Favoritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_id_receta_fkey" FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id_receta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
