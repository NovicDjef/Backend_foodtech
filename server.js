import express from 'express'
import cors from 'cors'
import multer from 'multer'
import userRoute from './routes/userRoute.js'
import adminRoute from './routes/adminRoute.js'
import roleRoute from "./routes/roleRoute.js"
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

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(cors())

// server.use((req, res, next) => {
// res.setHeader('Access-Controll-Allow-Origin', '*')
// res.setHeader('Access-Controll-Allow-Headers', 'Origin,X-Requested-With,Content,Accept,Content-Type,Authorization')
// res.setHeader('Access-Controll-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
// res.setHeader('Access-Control-Allow-Credentials', true);
// next()
// })
server.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5433'); // Remplacez par l'URL de votre application React
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Credentials', 'true');
if (req.method === 'OPTIONS') {
res.status(200).end();
} else {
next();
}
});

server.get('/', (req, res) => {
res.status(200).json({
message: 'Server is working !',
})
})

server.use("/", userRoute)
server.use("/", roleRoute)
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
server.use("/", heureOuveruteRoute)

server.use('/images', express.static('images'))

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces réseau
server.listen(PORT, HOST, () => {
console.log(`Server is running on http://${HOST}:${PORT}`);
});

export default server;