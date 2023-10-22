import fs from 'fs'
import ProductManager from './productManager.js'

const pm = new ProductManager('./products.json')

class CartManager {

    // Propiedad path que indica la ruta donde se encuentran los carritos.
    #path

    constructor(path) {
        this.#path = path
        this.#init()

    }
    // Busca si existe la ruta con el carrito, en caso de que no exista, la crea con un array vacio.
    async #init() {
        if (!fs.existsSync(this.#path)) {
            console.log(this.#path)
            await fs.promises.writeFile(this.#path, JSON.stringify([], null, 2))
        }
    }

    // Genera un ID automático para cada carrito. Si no existe ninguno, lo crea con ID 1.
    #generateID(carts) {
        return (carts.length === 0) ? 1 : carts[carts.length - 1].id + 1
    }

    async addCart() {
        // Verifica si la ruta del carrito existe
        if (!fs.existsSync(this.#path)) return 'Error! The cart path does not exist'
        let cart = await fs.promises.readFile(this.#path, 'utf-8')
        let carts = JSON.parse(cart)
        // Agrega el carrito con un ID único auto incrementable.
        const cartToAdd = { id: this.#generateID(carts), products: [] }
        carts.push(cartToAdd)
        // Escribe sobre el archivo y guarda el producto.
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, 2))
        return cartToAdd
    }

    async getCarts() {
        // Verifica si la ruta del carrito existe
        if (!fs.existsSync(this.#path)) return 'Error! The cart path does not exist'
        let data = await fs.promises.readFile(this.#path, 'utf-8')
        let result = JSON.parse(data)
        // Devuelve todos los carritos del Array Carts
        return result
    }

    async getCart(cid) {
        // Verifica si la ruta del carrito existe
        if (!fs.existsSync(this.#path)) return 'Error! The cart path does not exist'
        let data = await fs.promises.readFile(this.#path, 'utf-8')
        let carts = JSON.parse(data)
        // Busca si el ID del carrito obtenido, coincide con alguno de los carritos del Array Carts
        const result = carts.find(crt => crt.id == cid)
        if (!result) return console.log('Error! cart not found')
        return result
    }

    async addProduct(cid, pid) {

        // Obtengo el carrito seleccionado con la funcion getCart, y el ID obtenido.
        let cart = await this.getCart(cid)
        if (!cart) return `Error! Cart with ID: ${cid} was not found`

        const prd = await pm.getProductByID(pid)
        if (!prd) return `Error! Product with ID: ${pid} was not found`

        // Verifico en que lugar del Array (Index) se encuentra el producto a buscar.
        const indexPrd = cart.products.findIndex(item => item.product === pid)

        // Si el indice es mayor o igual a 0, significa que el producto existe, se le aumenta la cantidad sumandole 1.
        if (indexPrd > -1) {
            cart.products[indexPrd].quantity += 1
        }
        // Si no se encuentra el índice, significa que no existe el producto, sea crea un objeto con cantidad 1. 
        else {
            cart.products.push({
                product: pid,
                quantity: 1
            })
        }
        // Obtengo todos los carritos guardados en el Array, con la funcion getCarts
        let carts = await this.getCarts()
        if (!carts) return 'Error! Carts were not found'
        // Comparto los carritos del Array hasta encontrar el carrito modificado, y lo reemplazo con los nuevos datos. 
        carts = carts.map(item => {
            if (item.id === cid) {
                return cart
            } else return item
        })
        // Sobrescribe el archivo JSON y guarda el nuevo array con los productos actualizados.
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, 2))
        return cart

    }
}

export default CartManager