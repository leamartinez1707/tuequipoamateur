import fs from 'fs'

class ProductManager {

    // Propiedad path que indica la ruta donde se encuentran los productos. Representa la base de datos.
    #path

    constructor(path) {
        this.#path = path
        this.#init()

    }

    // Inicia la aplicación, y busca si existe la ruta de la "base de datos", en caso de que no exista, la crea con un array vacio.
    async #init() {
        if (!fs.existsSync(this.#path)) {
            await fs.promises.writeFile(this.#path, JSON.stringify([], null, 2))
        }
    }

    // Genera un ID automático para cada producto. Si no hay ninguno le deja ID 1.
    #generateID(products) {
        return (products.length === 0) ? 1 : products[products.length - 1].id + 1
    }

    async addProduct(product) {

        // Si el usuario no completa todos los datos, no se agrega el objeto
        if (!product.title || !product.price || !product.thumbnail || !product.code || !product.stock || !product.category) {
            return console.error('Error! Complete all fields')
        }
        // Verifica si la "base de datos" existe
        if (!fs.existsSync(this.#path)) return 'Error! The database path does not exist'
        let bs = await fs.promises.readFile(this.#path, 'utf-8')
        // Convierte el formato de los productos.
        let products = JSON.parse(bs)
        // Busca si el codigo del producto a agregar, coincide con alguno de los productos del array
        let foundCode = products.find(prd => product.code === prd.code)

        // Si el objeto ya existe, se le avisa al usuario
        if (foundCode) return `Error! this product with CODE: ${product.code} already exists`

        // En caso de que todas las condiciones esten bien, se pushea el objeto al array. Primero estableciendo una variable que cree el producto a agregar con su ID correspondiente.
        const prdToAdd = { id: this.#generateID(products), ...product }
        products.push(prdToAdd)
        // Sobreescribe el archivo JSON y guardando el array actualizado.
        await fs.promises.writeFile(this.#path, JSON.stringify(products, null, 2))
        return prdToAdd
    }

    async deleteProduct(id) {
        // Verifica si la "base de datos" existe
        if (!fs.existsSync(this.#path)) return 'Error! The database path does not exist'
        let bs = await fs.promises.readFile(this.#path, 'utf-8')
        // Convierte el formato de los productos.
        let products = JSON.parse(bs)
        // Crea un nuevo array con todos los productos que no contengan el ID marcado.
        let newProducts = products.filter(prd => prd.id !== id)
        // Si la longitud del array anterior y del nuevo es distinta, entonces el producto fue encontrado y eliminado correctamente.
        let ifFound = false
        if (products.length !== newProducts.length) ifFound = true
        if (!ifFound) return 'Error! this product does not exists'
        // Sobreescribe el archivo y guarda el nuevo array con el producto borrado.
        await fs.promises.writeFile(this.#path, JSON.stringify(newProducts, null, 2))
        return newProducts;
    }

    async updateProduct(id, updateProduct) {
        // Verifica si la "base de datos" existe
        if (!fs.existsSync(this.#path)) return 'Error! The database path does not exist'
        let bs = await fs.promises.readFile(this.#path, 'utf-8')
        // Convierte el formato de los productos.
        let products = JSON.parse(bs)
        let ifFound = false
        // Crea un nuevo array de productos, y el producto que coincide con el ID, es actualizado. Primero desglosa el producto y luego carga los datos nuevos.
        let newProducts = products.map(prd => {
            if (prd.id === id) {
                ifFound = true
                return {
                    ...prd,
                    ...updateProduct
                }
            } else return prd
        })
        if (!ifFound) return 'Error! product not found for update'
        // Busca si el codigo del producto a agregar, coincide con alguno de los productos del array
        let foundCode = products.find(prd => updateProduct.code === prd.code)

        // Si el objeto ya existe, se le avisa al usuario
        if (foundCode) return `Error! this product with CODE: ${updateProduct.code} already exists`
        // Sobrescribe el archivo y guarda el nuevo array con el producto actualizado.
        await fs.promises.writeFile(this.#path, JSON.stringify(newProducts, null, 2))
        return newProducts.find(pr => pr.id === id)
    }

    async getProducts() {
        // Verifica si la "base de datos" existe
        if (!fs.existsSync(this.#path)) return 'Error! The database path does not exist'
        let bs = await fs.promises.readFile(this.#path, 'utf-8')
        // Convierte el formato de los productos.
        let products = JSON.parse(bs)
        return products
    }

    async getProductByID(id) {
        // Verifica si la "base de datos" existe
        if (!fs.existsSync(this.#path)) return 'Error! The database path does not exist'
        let bs = await fs.promises.readFile(this.#path, 'utf-8')
        // Convierte el formato de los productos.
        let products = JSON.parse(bs)
        if (!products) return 'Error! Products were not found'
        // Busca el producto que coincida con el ID escrito.
        let product = products.find(prd => prd.id === id)
        if (!product) return console.log('Error! product not found')
        return product
    }
}

export default ProductManager
