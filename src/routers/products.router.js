import { Router } from 'express'
import { productModel } from '../dao/models/product.model.js'

const router = Router()

export const getProducts = async (req, res) => {

    try {

        const { limit = 10, page = 1 } = req.query
        // const limit = req.query.limit || 10
        // const page = req.query.page || 1
        const pageFilters = {}

        // if (req.query.category || req.query.stock) {
        //     pageFilters.category = req.query.category
        //     pageFilters.stock = req.query.stock
        //     console.log(pageFilters)
        // }

        if (req.query.category) pageFilters.category = req.query.category
        if (req.query.stock) pageFilters.stock = req.query.stock


        const paginateOpt = { lean: true, limit, page }

        if (req.query.sort === 'asc') paginateOpt.sort = { price: 1 }
        if (req.query.sort === 'des') paginateOpt.sort = { price: -1 }

        const result = await productModel.paginate(pageFilters, paginateOpt)

        let previousLink

        if (req.query.page) {

            const modifiedUrl = req.originalUrl.replace(`page=${req.query.page}`, `page=${result.prevPage}`)
            previousLink = `http://${req.hostname}:8080${modifiedUrl}`
        } else {
            previousLink = `http://${req.hostname}:8080${req.originalUrl}&page=${result.prevPage}`
        }
        let nextLink

        if (req.query.page) {

            const modifiedUrl = req.originalUrl.replace(`page=${req.query.page}`, `page=${result.nextPage}`)
            nextLink = `http://${req.hostname}:8080${modifiedUrl}`
        } else {
            nextLink = `http://${req.hostname}:8080${req.originalUrl}&page=${result.nextPage}`
        }

        return {
            statusCode: 200,
            response: {
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                previousLink: result.hasPrevPage ? previousLink : null,
                nextLink: result.hasNextPage ? nextLink : null
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


// Ya en app.js se indica que la direccion es /api/products
router.get('/', async (req, res) => {

    // const result = await productManager.getProducts()
    let result = await getProducts(req, res)
    return res.status(200).json({ status: 'success', payload: result })

})

router.get('/:pid', async (req, res) => {

    let pid = req.params.pid
    const result = await productModel.findOne({ _id: pid })
    if (!result) return res.status(404).send({ status: 'error', error: 'Product does not exists' })
    return res.status(200).json({ status: 'success', payload: result })

})

router.post('/', async (req, res) => {

    let { title, description, price, code, category, stock, thumbnail } = req.body

    let result = await productModel.create({
        title, description, price, code, category, stock, thumbnail
    })
    if (!result) return res.status(400).send({ status: 'error', error: 'The product could not be added' })
    return res.status(201).send({ status: 'success', payload: result })

})
router.put('/:pid', async (req, res) => {

    let pid = req.params.pid
    let productToUpdate = req.body
    if (!productToUpdate.title || !productToUpdate.description || !productToUpdate.price || !productToUpdate.code || !productToUpdate.category || !productToUpdate.stock || !productToUpdate.thumbnail)
        return res.send({ status: 'error', error: 'Incomplete values' })
    let result = await productModel.updateOne({ _id: pid }, productToUpdate)
    if (!result) return res.status(400).send({ status: 'error', error: 'The product could not be updated' })
    return res.status(200).json({ status: 'success', payload: result })

})

router.delete('/:pid', async (req, res) => {

    let pid = req.params.pid
    let result = await productModel.deleteOne({ _id: pid })
    if (!result) return res.status(400).send({ status: 'error', error: 'The product could not be deleted' })
    return res.status(200).json({ status: 'success', payload: result })
})
export default router