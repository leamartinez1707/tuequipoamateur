import { Router } from "express";
import { getProducts } from "./products.router.js";
import { getProductsFromCart } from '../routers/carts.router.js'
import { productModel } from "../dao/models/product.model.js";
import { publicRoutes } from "../middlewares/auth.middlewares.js"

const router = Router()

router.get('/', publicRoutes, async (req, res) => {

    let result = await getProducts(req, res)


    if (result.statusCode === 200) {
        const totalPages = []
        let link

        for (let index = 1; index <= result.response.totalPages; index++) {
            if (!req.query.page) {

                link = `http://${req.hostname}:8080${req.originalUrl}&page=${index}`

            } else if (req.query.page > result.response.totalPages) {

                link = `http://${req.hostname}:8080${req.originalUrl}&page=${index}`
            }
            else {
                const modifiedUrl = req.originalUrl.replace(`page=${req.query.page}`, `page=${index}`)
                link = `http://${req.hostname}:8080${modifiedUrl}`

            }
            totalPages.push({ page: index, link })
        }

        if (result.response.page > totalPages.length || result.response.page < 1 || /[a-z]/i.test(result.response.page)) {
            console.log(result.response.page)
            console.log(totalPages.length)
            return res.render("pageError", {
                error: 'La pagina que está buscando no existe!'
            })
        }
        const user = req.session.user

        res.render("home", {
            user,
            products: result.response.payload,
            paginateInfo: {
                hasPrevPage: result.response.hasPrevPage,
                hasNextPage: result.response.hasNextPage,
                previousLink: result.response.previousLink,
                nextLink: result.response.nextLink,
                totalPages
            }
        })
    }

    else {
        console.log(result.response.error)
        res.status(result.statusCode).render("pageError")
    }

})

router.get('/product/:pid', publicRoutes, async (req, res) => {
    try {
        let pid = req.params.pid

        let product = await productModel.findById(pid)
        if (product === null) return res.status(404).render("pageError")
        res.status(200).render("productDetail", product)
    } catch (err) {
        console.log('Error /pid')
        res.status(500).render("pageError", {
            error: 'No pudimos encontrar el producto con este ID!!'
        })
    }
})

router.get('/realtimeproducts', publicRoutes, (req, res) => {

    res.render("realTimeProducts")
})
router.get('/:cid', publicRoutes, async (req, res) => {


    let cart = await getProductsFromCart(req, res)

    if (cart.statusCode === 200) {
        res.status(cart.statusCode).render("cart", {
            cartId: cart.response.payload._id,
            cartProducts: cart.response.payload.products,
        })
    } else {
        console.log('Error /cid')
        res.status(cart.statusCode).render("pageError", {
            error: 'No pudimos encontrar el carrito con este ID. Por favor chequeá que sea el correspondiente!'
        })
    }

})

export default router