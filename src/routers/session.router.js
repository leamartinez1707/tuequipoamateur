import { Router } from "express";
import passport from "passport";

const router = Router()

router.post('/register', passport.authenticate('register', {
    failureRedirect: '/session/errorRegister',
    successRedirect: '/session/registerAccepted'
}), async (req, res) => {

})

router.post('/login', passport.authenticate('login', { failureRedirect: '/session/errorLogin' }), async (req, res) => {

    if (!req.user) {
        res.status(400).send({ status: 'error', error: error.message })
    }
    if (req.user.email == 'adminCoder@coder.com') {
        req.session.user = {
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name
        }
    } else {
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart
        }
    }

    res.redirect('/products')

})


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
            res.status(500).render('pageError')
        } else res.redirect('/')

    })
})

router.get('/gitCallback', passport.authenticate('github', { failureRedirect: '/session/errorLogin' }), async (req, res) => {

    req.session.user = req.user
    res.redirect('/')
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), (req, res) => {

})




export default router;