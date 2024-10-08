import express from 'express'
import dotenv from 'dotenv';
import bodyParser from "body-parser"

import cors from 'cors'
import multer from 'multer'
import userRoute from './routes/userRoute.js'
import adminRoute from './routes/adminRoute.js'
// import roleRoute from "./routes/roleRoute.js"
import slideRoute from "./routes/slideRoute.js"
import commandeRoute from "./routes/commandeRoute.js"
import noteRoute from "./routes/noteRoute.js"
import livraisonRoute from "./routes/livraisonRoute.js"
import menuRoute from "./routes/menuRoute.js"
import historiqueRoute from "./routes/historiqueRoute.js"
import geolocalisationRoute from "./routes/geolocalisationRoute.js"
import categorieRoute from './routes/categorieRoute.js'
import reservationRoute from "./routes/reservationRoute.js"
import payementRoute from "./routes/payementRoute.js"
import platsRoute from "./routes/platsRoute.js"
import articleRoute from "./routes/articleRoute.js"
import restaurantRoute from "./routes/restaurantRoute.js"
import villeRoute from "./routes/villeRoute.js"
import otpRoute from "./routes/otpRoute.js"
import heureOuveruteRoute from "./routes/heureOuveruteRoute.js"
import colisRoute from "./routes/colisRoute.js"
import menusRapideRoute from "./routes/menusRapideRoute.js"
import prixRoute from "./routes/prixRoute.js"
import notificationRoute from "./routes/notificationRoute.js"
import { Expo } from 'expo-server-sdk';

dotenv.config();

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cors())


// server.use((req, res, next) => {
// res.setHeader('Access-Controll-Allow-Origin', '*')
// res.setHeader('Access-Controll-Allow-Headers', 'Origin,X-Requested-With,Content,Accept,Content-Type,Authorization')
// res.setHeader('Access-Controll-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
// res.setHeader('Access-Control-Allow-Credentials', true);
// next()
// })
server.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173'); // Remplacez par l'URL de votre application React
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Credentials', 'true');
if (req.method === 'OPTIONS') {
res.status(200).end();
} else {
next();
}
});

global.expo = new Expo();
server.get('/', (req, res) => {
res.status(200).json({
message: 'Server is working !',
})
})

server.use("/", userRoute)
server.use("/", prixRoute)
server.use("/", adminRoute)
server.use("/", slideRoute)
server.use("/", commandeRoute)
server.use("/", noteRoute)
server.use("/", livraisonRoute)
server.use("/", menuRoute)
server.use("/", historiqueRoute)
server.use("/", geolocalisationRoute)
server.use("/", categorieRoute)
server.use("/", reservationRoute)
server.use("/", payementRoute)
server.use("/", platsRoute)
server.use("/", articleRoute)
server.use("/", restaurantRoute)
server.use("/", villeRoute)
server.use("/", otpRoute)
server.use("/", colisRoute)
server.use("/", menusRapideRoute)
server.use("/", heureOuveruteRoute)
server.use("/", notificationRoute)

server.use('/images', express.static('images'))


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces réseau
server.listen(PORT, HOST, () => {
console.log(`Server is running on http://${HOST}:${PORT}`);
});

export default server;