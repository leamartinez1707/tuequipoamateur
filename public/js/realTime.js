const socket = io()

let form = document.getElementById("formulario")
let tableB = document.getElementById("table-body")
let product = {}

// Swal.fire
function swalDelete() {
    Swal.fire({
        title: `Producto borrado!!`,
        text: "Se borró el producto correctamente",
        icon: "warning"
    })
}
// Swal.fire
function swalAdded() {
    Swal.fire({
        title: `Producto agregado!!`,
        text: "Se agregó el producto correctamente",
        icon: "success"
    })
}
// Resetea el formulario para que quede vacio.
function resetForm(obj) {
    obj.reset()
}
// Vacia la tabla de productos
function emptyTable() {

    tableB.innerHTML = " "
}
// Crea una TableRow con las propiedades de cada producto y las inserta en la tabla.
function showProducts(list) {
    list.forEach(prd => {

        let tableB = document.getElementById("table-body")
        let fila = document.createElement("tr")
        fila.innerHTML = `
            
            <td>${prd._id}</td>
            <td>${prd.title}</td>
            <td>${prd.description}</td>
            <td>$ ${prd.price}</td>
            <td>${prd.category}</td>
            <td>${prd.stock}</td>
            <td>${prd.code}</td>
            <td><btn class="btn btn-danger btn_delete" onClick="deleteProduct('${prd._id}')">Eliminar</btn>
            </td>
            `

        tableB.append(fila)
    })
}
// Borra el producto seleccionado, mediante el ID que se le pasa desde el boton.
function deleteProduct(pid) {
    emptyTable()
    socket.emit('delete', pid)
    console.log(pid)
    swalDelete()
}
// Agregar un producto con los datos obtenidos en el formulario
form.addEventListener("submit", (ev) => {
    ev.preventDefault()

    product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        code: document.getElementById("code").value,
        category: document.getElementById("category").value,
        stock: document.getElementById("stock").value,
        thumbnail: document.getElementById("thumbnail").value
    }

    swalAdded()
    resetForm(form)
    socket.emit('add', product)
    return (false);
})
// Escucha al servidor, donde se envió la lista de productos guardada, e inserta los productos en una tabla mediante una funcion.
// Luego de obtener los productos, limpia la tabla de todos los sockets conectados e inserta los productos actualizados.
socket.on('products', data => {
    emptyTable()
    showProducts(data)
})







