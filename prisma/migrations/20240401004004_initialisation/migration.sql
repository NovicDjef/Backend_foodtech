-- CreateEnum
CREATE TYPE "Name_categorie" AS ENUM ('Camerounaise', 'Senegalaise', 'Americaine', 'Marocaine', 'Ivoiriene', 'Maliene', 'Francaise');

-- CreateEnum
CREATE TYPE "Ville" AS ENUM ('DOUALA', 'YAOUNDE', 'KRIBI', 'BAFOUSSAM', 'BUA');

-- CreateEnum
CREATE TYPE "MensionRestaurant" AS ENUM ('FAVORITE', 'PROCHE', 'NOM_FAVORITE');

-- CreateEnum
CREATE TYPE "MensionPlat" AS ENUM ('FAVORITE', 'NON_FAVORITE');

-- CreateEnum
CREATE TYPE "Statut_commande" AS ENUM ('EN_ATTENTE', 'EN_COURS_DE_LIVRAISON', 'LIVREE');

-- CreateEnum
CREATE TYPE "Statut_livraison" AS ENUM ('LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "Notation" AS ENUM ('ZERO', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ');

-- CreateEnum
CREATE TYPE "Prix_reservation" AS ENUM ('MILLE_FRANCS', 'Deux_MILLE_FRANCS', 'TROIS_MILLE_FRANCS');

-- CreateEnum
CREATE TYPE "Mode_payement" AS ENUM ('MOBILE_MONEY', 'CARTE_BANCAIRE');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "historiqueId" INTEGER,
    "geolocalisationId" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_role" (
    "adminId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_role_pkey" PRIMARY KEY ("adminId","roleId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "historiqueId" INTEGER,
    "articleId" INTEGER,
    "payementId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" SERIAL NOT NULL,
    "name_categorie" "Name_categorie" NOT NULL DEFAULT 'Camerounaise',
    "image_categorie" TEXT NOT NULL,
    "description" TEXT,
    "restaurantId" INTEGER,
    "menuId" INTEGER,
    "platsId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "nom_restaurant" TEXT NOT NULL,
    "ville" "Ville" NOT NULL DEFAULT 'DOUALA',
    "phone_restaurant" TEXT,
    "menssion" "MensionRestaurant" NOT NULL DEFAULT 'NOM_FAVORITE',
    "Adresse_restaurant" TEXT NOT NULL,
    "image_restaurant" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "platsId" INTEGER,
    "articleId" INTEGER,
    "reservationId" INTEGER,
    "adminId" INTEGER,
    "menuId" INTEGER,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "nom_menu" TEXT NOT NULL,
    "image_menu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plats" (
    "id" SERIAL NOT NULL,
    "nom_plat" TEXT NOT NULL,
    "image_plat" TEXT NOT NULL,
    "description_plat" TEXT,
    "prix_plat" INTEGER NOT NULL,
    "menssionPLat" "MensionPlat" DEFAULT 'FAVORITE',
    "restaurantId" INTEGER,
    "menuId" INTEGER,
    "CommandeId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "articleId" INTEGER,

    CONSTRAINT "Plats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" SERIAL NOT NULL,
    "statut_commende" "Statut_commande" NOT NULL DEFAULT 'EN_ATTENTE',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "articleId" INTEGER,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livraison" (
    "id" SERIAL NOT NULL,
    "statut_livraison" "Statut_livraison" NOT NULL DEFAULT 'LIVREE',
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "userId" INTEGER,
    "commandeId" INTEGER,
    "adminId" INTEGER,

    CONSTRAINT "Livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "notation" "Notation" NOT NULL DEFAULT 'ZERO',
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "numero_table" TEXT,
    "nombre_personne" INTEGER NOT NULL,
    "prix_reservation" "Prix_reservation" NOT NULL DEFAULT 'MILLE_FRANCS',
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payement" (
    "id" SERIAL NOT NULL,
    "montant" INTEGER NOT NULL,
    "mode_payement" "Mode_payement" NOT NULL DEFAULT 'MOBILE_MONEY',
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Payement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide" (
    "id" SERIAL NOT NULL,
    "name_slide" TEXT NOT NULL,
    "image_slide" TEXT NOT NULL,
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geolocalisation" (
    "id" SERIAL NOT NULL,
    "name_point_localise" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "Latitude" DOUBLE PRECISION NOT NULL,
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Geolocalisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" SERIAL NOT NULL,
    "statut_historique" TEXT NOT NULL,
    "reatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3),
    "commandeId" INTEGER,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceLivraison" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceLivraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritePlats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "platsId" INTEGER NOT NULL,

    CONSTRAINT "FavoritePlats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CommandeToServiceLivraison" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GeolocalisationToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "_CommandeToServiceLivraison_AB_unique" ON "_CommandeToServiceLivraison"("A", "B");

-- CreateIndex
CREATE INDEX "_CommandeToServiceLivraison_B_index" ON "_CommandeToServiceLivraison"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GeolocalisationToUser_AB_unique" ON "_GeolocalisationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GeolocalisationToUser_B_index" ON "_GeolocalisationToUser"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_historiqueId_fkey" FOREIGN KEY ("historiqueId") REFERENCES "Historique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_geolocalisationId_fkey" FOREIGN KEY ("geolocalisationId") REFERENCES "Geolocalisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_role" ADD CONSTRAINT "User_role_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_role" ADD CONSTRAINT "User_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_historiqueId_fkey" FOREIGN KEY ("historiqueId") REFERENCES "Historique"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_payementId_fkey" FOREIGN KEY ("payementId") REFERENCES "Payement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_platsId_fkey" FOREIGN KEY ("platsId") REFERENCES "Plats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_platsId_fkey" FOREIGN KEY ("platsId") REFERENCES "Plats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_CommandeId_fkey" FOREIGN KEY ("CommandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plats" ADD CONSTRAINT "Plats_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlats" ADD CONSTRAINT "FavoritePlats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlats" ADD CONSTRAINT "FavoritePlats_platsId_fkey" FOREIGN KEY ("platsId") REFERENCES "Plats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommandeToServiceLivraison" ADD CONSTRAINT "_CommandeToServiceLivraison_A_fkey" FOREIGN KEY ("A") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommandeToServiceLivraison" ADD CONSTRAINT "_CommandeToServiceLivraison_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceLivraison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeolocalisationToUser" ADD CONSTRAINT "_GeolocalisationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Geolocalisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeolocalisationToUser" ADD CONSTRAINT "_GeolocalisationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
