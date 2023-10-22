import { Router } from "express";
import { privateRoutes, publicRoutes } from "../middlewares/auth.middlewares.js";

const router = Router()

router.get('/', privateRoutes, (req, res) => {

    res.render('sessions/login')

})

router.get('/register', privateRoutes, async (req, res) => {
    res.render('sessions/register')
})
router.get('/current', publicRoutes, (req, res) => {
    
    res.render('sessions/profile', req.session.user)
})

router.get('/session/error', (req, res) => res.render('pageError'))

router.get('/session/errorRegister', (req, res) => {

    res.render('pageError', {
        error: 'No se pudo registrar al usuario, intente nuevamente verificando que el usuario ya no esté creado'
    })
})
router.get('/session/errorLogin', (req, res) => {
    res.render('pageError', {
        error: 'Verifique que los datos del usuario sean correctos'
    })
})
router.get('/session/registerAccepted', (req, res) => {
    res.render('sessions/registerAccepted')
})

export default router