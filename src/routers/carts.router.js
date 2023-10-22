import { Router } from 'express'
import cartModel from '../dao/models/cart.model.js'
import { productModel } from '../dao/models/product.model.js'

const router = Router()

export const getProductsFromCart = async (req, res) => {
    try {
        const cid = req.params.cid
        let cart = await cartModel.findById(cid).populate('products.product').lean()
        if (!cart) {
            return {
                statusCode: 404, response: {
                    status: 'error', error: 'Cart was not found'
                }
            }
        } else {
            return {
                statusCode: 200,
                response: { status: 'success', payload: cart }
            }
        }
    } catch (error) {
        return {
            statusCode: 500,
            response: {
                status: 'error', error: error.message
            }
        }
    }
}

// Ya en app.js se indica que la direccion es /products
router.get('/:cid', async (req, res) => {

    let result = await getProductsFromCart(req, res)
    res.status(result.statusCode).json(result.response)
})
router.delete('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid

        // BUSCAR EL CARRITO CON EL ID QUE SE LE PASO POR PARAMETRO
        let cart = await cartModel.findById(cid).lean()

        if (cart === null) res.status(404).json({ status: 'error', error: `Cart "${cid}" was not found` })

        // CARRITO VACIO
        cart.products = []

        // ACTUALIZAR EL CARRITO EN LA BASE DE DATOS 
        const result = await cartModel.findByIdAndUpdate(cid, cart, { Document: 'after' }).lean()

        res.status(200).json({ status: 'success', payload: result })

    } catch (err) {
        res.status(500).json({ status: 'error', payload: err.message })
    }
})
router.put('/:cid', async (req, res) => {

    // Deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
    try {
        const cid = req.params.cid

        // BUSCAR EL CARRITO CON EL ID QUE SE LE PASO POR PARAMETRO
        let cart = await cartModel.findById(cid)
        if (cart === null) {
            res.status(404).json({ status: 'error', error: `Cart "${cid}" was not found` })
        }
        // CREAR UN NUEVO BODY DEL CARRITO CON LOS PARAMETROS PASADOS EN BODY
        let newCart = req.body

        // VALIDA SI EXISTE EL ARRAY DE PRODUCTOS NUEVO PASADO POR BODY
        if (!newCart.products) res.status(400).json({ status: 'error', error: 'Field products is required' })

        // VALIDACIONES PARA VERIFICAR SI LOS DATOS DEL BODY SON CORRECTOS
        for (const prd of newCart.products) {
            console.log(prd)
            if (!prd.hasOwnProperty('product') || !prd.hasOwnProperty('quantity')) {
                res.status(400).json({ status: 'error', error: 'The properties ID or Quantity are not valid' })
            }
            if (prd.quantity === 0) {
                res.status(400).json({ status: 'error', error: 'Quantity cant be 0' })
            }
            if (typeof prd.quantity !== 'number') {
                res.status(400).json({ status: 'error', error: 'Quantity must be a Number' })
            }
            const prdToAdd = await productModel.findById(prd.product)
            if (prdToAdd === null) {
                res.status(400).json({ status: 'error', error: `Product with ID: ${prd.product} was not found` })
            }

        }
        // MODIFICO LOS PRODUCTOS ANTERIORES POR LOS NUEVOS PRODUCTOS
        cart.products = newCart.products;

        const result = await cartModel.findByIdAndUpdate(cid, cart, { Document: 'after' })
        res.status(200).json({ status: 'success', payload: result })

    } catch (err) {
        res.status(500).json({ status: 'error', payload: err.message })
    }
})

router.post('/', async (req, res) => {

    try {
        const result = await cartModel.create({})
        res.status(201).json({ status: 'success', payload: result })
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message })
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid
        const pid = req.params.pid
        let cart = await cartModel.findById(cid).lean()

        if (cart === null) res.status(404).json({ status: 'error', error: `Cart "${cid}" was not found` })
        let product = await productModel.findById(pid).lean()
        if (product === null) res.status(404).json({ status: 'error', error: `Product "${pid}" was not found` })
        let quantity = req.params.quantity || 1
        product = { product, quantity }

        if (quantity === null) res.status(400).json({ status: 'error', error: 'Quantity is null' })
        let productIndex = cart.products.findIndex(prd => prd.product._id == pid)
        console.log(cart.products[productIndex])
        console.log(productIndex)
        if (productIndex < 0) {
            cart.products.push(product)
        } else {
            cart.products[productIndex].quantity++
        }
        const result = await cartModel.findByIdAndUpdate(cid, cart, { Document: 'after' }).lean()
        res.status(201).json({ status: 'success', payload: result })

    } catch (err) {
        res.status(500).json({ status: 'error', payload: err.message })
    }
})

router.delete('/:cid/product/:pid', async (req, res) => {

    try {
        const cid = req.params.cid
        const pid = req.params.pid

        // BUSCAR EL CARRITO CON EL ID QUE SE LE PASO POR PARAMETRO
        let cart = await cartModel.findById(cid).lean()

        if (cart === null) res.status(404).json({ status: 'error', error: `Cart "${cid}" was not found` })

        // BUSCAR EL PRODUCTO QUE CONTENGA EL ID QUE SE LE PASO POR PARAMETRO
        let product = await productModel.findById(pid).lean()

        if (product === null) res.status(404).json({ status: 'error', error: `Product "${pid}" was not found` })

        // ---> CREAR UNA VERIFICACION DONDE SI EL PRODUCTO NO ES ENCONTRADO DE UN ERROR

        // FILTRAR LOS PRODUCTOS DEL CARRITO Y ELIMINAR EL PRODUCTO OBTENIDO ANTERIORMENTE
        cart.products = cart.products.filter(prd => prd.product.toString() !== pid)

        if (!cart.products) res.status(404).json({ status: 'error', error: `Product "${pid}" in cart ${cid} was not found` })

        // ACTUALIZAR EL CARRITO EN LA BASE DE DATOS, SIN EL PRODUCTO ANTERIORMENTE BORRADO
        const result = await cartModel.findByIdAndUpdate(cid, cart, { Document: 'after' }).lean()

        res.status(200).json({ status: 'success', payload: result })

    } catch (err) {
        res.status(500).json({ status: 'error', payload: err.message })
    }

})
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid
        const pid = req.params.pid

        // BUSCAR EL CARRITO CON EL ID QUE SE LE PASO POR PARAMETRO
        const cart = await cartModel.findById(cid)
        console.log(cart + 'error en el carrito')
        if (cart === null) {
            res.status(404).json({ status: 'error', error: `Cart "${cid}" was not found` })
        }
        // ---> CREAR UNA VERIFICACION DONDE SI EL PRODUCTO NO ES ENCONTRADO DE UN ERROR

        let productTest = await productModel.findById(pid)

        if (!productTest) res.status(404).json({ status: 'error', error: `Product with ID "${pid}" was not found` })
        let productUpdate = cart.products.findIndex(prd => prd.product.toString() === pid)

        if (productUpdate < 0) res.status(404).json({ status: 'error', error: `Product "${pid}" in cart ${cid} was not found` })

        console.log(productUpdate + 'index del producto ')
        let newQuantity = req.body.quantity

        if (newQuantity === 0) res.status(400).json({ status: 'error', error: 'Quantity value cant be 0' })
        if (!newQuantity) res.status(400).json({ status: 'error', error: 'Quantity value is a required field' })
        if (typeof newQuantity !== 'number') res.status(400).json({ status: 'error', error: 'Quantity must be a number' })

        console.log(newQuantity)
        cart.products[productUpdate].quantity = newQuantity

        // ACTUALIZAR EL CARRITO EN LA BASE DE DATOS, SIN EL PRODUCTO ANTERIORMENTE BORRADO
        const result = await cartModel.findByIdAndUpdate(cid, cart, { Document: 'after' }).lean()
        if (!result) res.status(404).json({ status: 'error', error: 'Cart could not be updated' })
        res.status(200).json({ status: 'success', payload: result })

    } catch (err) {
        res.status(500).json({ status: 'error', payload: err.message })
    }
})


export default router