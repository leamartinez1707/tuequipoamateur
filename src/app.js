import express from 'express'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import { productModel } from './dao/models/product.model.js'
import productRouter from './routers/products.router.js'
import cartsRouter from './routers/carts.router.js'
import viewsRouter from './routers/views.router.js'
import sessionViewRouter from './routers/sessionView.router.js'
import sessionRouter from './routers/session.router.js'

import passport from 'passport'
import initializePassport from './config/passport.config.js'

const app = express();

const MONGO_URL = 'mongodb+srv://leamartinez1707:leandro1707@elemcluster.qnq63c2.mongodb.net'
const MONGO_DB = 'ecommerce'

app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
        dbName: MONGO_DB
    }),
    secret: 'secreto',
    resave: true,
    saveUninitialized: true
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// Para cargar archivos en formato json con POST
app.use(express.json())

// Setear Handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')
// Permite leer los archivos de la carpeta public
app.use(express.static('./public'))

// Con esta expresion permitimos enviar datos POST desde un formulario HTML
app.use(express.urlencoded({ extended: true }))

app.use('/', sessionViewRouter)
app.use('/session', sessionRouter)
app.use('/api/products', productRouter)
app.use('/api/carts', cartsRouter)
app.use('/products', viewsRouter)
app.use('/carts', viewsRouter)




try {

    // Conexion a la base de datos de Mongoose
    await mongoose.connect(MONGO_URL, {
        dbName: MONGO_DB
    })
    console.log('Conectado a la DB')

    // App funciona como servidor web, escuchamos las peticiones en el puerto 8080
    const httpsrv = app.listen(8080, () => console.log('Server is up !!'))

    const io = new Server(httpsrv)

    io.on('connection', async (socket) => {
        console.log(`Nuevo cliente conectado: ${socket.id}`)
        const productsList = await productModel.find().lean()
        socket.emit('products', productsList)

        socket.on('add', async product => {
            await productModel.create(product)
            const productsList = await productModel.find().lean()
            io.emit('products', productsList)
        })
        socket.on('delete', async id => {
            await productModel.deleteOne({ _id: id })
            let productsList = await productModel.find().lean()
            io.emit('products', productsList)

        })
    })
} catch (error) {
    console.log(error.message)

}







