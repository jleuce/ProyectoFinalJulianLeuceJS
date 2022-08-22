//Defino las clases que voy a usar
// Clase de ITEMS que se ofrecen
class Item {
  constructor(id, nombre, precio, cantidad, imagen) {
    this.id = Items.length;
    this.nombre = nombre.toUpperCase();
    this.precio = precio;
    this.cantidad = cantidad;
    this.imagen = imagen;
  }
}
//creo la clase de objeto que se van a trabajar en el carrito
class eCarrito {
  constructor(nombre, cantidad, precio) {
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
  }
}
//Creo los arrays contenedores de los ITEMS y del CARRITO
const Items = [];
const Carrito = [];
//Inicio el programa
// Si hay algo en el local store pregunto si quiere recuperar los datos sino traigo los del JSON
if (localStorage.getItem("ItemsOrigen") != null) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "Se encontraron datos guardados!!",
      text: "¿Desea recuperar la informacion?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Recuperar",
      cancelButtonText: "Descartar",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        //Limpio el array ITEMS
        Items.splice(0, Items.length);
        //Traigo y cargo en el array ITEMS lo que habia en el localstorage
        let itemGuardadoEnJSON = localStorage.getItem("ItemsOrigen");
        const itemGuardadoEnObjeto = JSON.parse(itemGuardadoEnJSON);
        itemGuardadoEnObjeto.forEach((element) => {
          Items.push(element);
        });
        //Traigo y cargo en el array CARRITO lo que habia en el localstorage
        let guardadoEnJSON = localStorage.getItem("carrito");
        const guardadoEnObjeto = JSON.parse(guardadoEnJSON);
        guardadoEnObjeto.forEach((element) => {
          Carrito.push(element);
        });
        //Si habia algo en el carrito guardado lo represento en el HTML
        if (Carrito.length > 0) {
          representarCarritoYsusObjetosEnHTML();
          CalcularYMostrarPrecioTotalDelCarrito();
          darFuncionamientoModal();
        }
        cargarInicioAlHTML(Items);
        funcionamientoBotonesIniciales();
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          "Descartado",
          "Datos eliminados del localStorage",
          "error"
        );
        localStorage.removeItem("carrito");
        localStorage.removeItem("ItemsOrigen");
        traerRepresentarArchivoJSON();
      }
    });
} else {
  traerRepresentarArchivoJSON();
}
//FUNCIONES
function traerRepresentarArchivoJSON() {
  //Traigo el archivoJSON
  return (
    fetch("./ItemsInFolder.json")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((objetoJSON) => {
          Items.push(
            new Item(
              0,
              objetoJSON.nombre,
              objetoJSON.precio,
              objetoJSON.cantidad,
              objetoJSON.imagen
            )
          );
        });
      })
      //Represento en el HTML el archivoJSON
      .then(() => {
        cargarInicioAlHTML(Items);
        funcionamientoBotonesIniciales();
      })
  );
}
function funcionamientoBotonesIniciales() {
  //Defino nombre a los elementos del HTML
  const botonSumar = document.querySelectorAll(".botonSumar");
  const botonRestar = document.querySelectorAll(".botonRestar");
  const botonAgregar = document.querySelectorAll(".agregar");
  const cuadradoItem = document.querySelectorAll(".cuadradoItem");
  // Defino que pasa con los eventos Eventos
  // Pintar de rojo al pararse
  cuadradoItem.forEach((cuadrado) => {
    cuadrado.addEventListener("mouseover", () => {
      cuadrado.style.backgroundColor = "rgba(255,0,0,0.5)";
    });
    cuadrado.addEventListener("mouseout", () => {
      cuadrado.style.backgroundColor = "rgba(255,255,255,0.5)";
    });
  });
  // Configuro que pasa cuando todo el boton + OK
  botonSumar.forEach((card) => {
    card.addEventListener("click", () => {
      let objetoDevuelve = traerElementoContador(card);
      let valorContador = objetoDevuelve.innerHTML;
      let cantidadDisponible = traerCantidadDelObjetoDelArray(
        Items,
        buscarTituloTarjetaHTML(card)
      );
      if (valorContador == cantidadDisponible) {
        cartelEnHTML("error", "No hay mas cantidad disponible");
      } else {
        objetoDevuelve.innerHTML++;
      }
    });
  });
  // Configuro que pasa cuando todo el boton - OK
  botonRestar.forEach((card) => {
    card.addEventListener("click", () => {
      let objetoDevuelve = traerElementoContador(card);
      let valorContador = objetoDevuelve.innerHTML;
      if (valorContador != 0) {
        objetoDevuelve.innerHTML--;
      }
    });
  });
  //  AGREGAR - Arma un nuevo htlm y guarda el item y valor en un array y descuenta del objeto inicial
  botonAgregar.forEach((element) => {
    element.addEventListener("click", () => {
      if (traerElementoContador(element).innerHTML != 0) {
        const nombreTitulo = element.parentElement.querySelector(".titulos");
        const cantidad = element.parentElement.querySelector(".contador");
        // LLAMO A UN TOAST
        AvisoTemporal(
          nombreTitulo.innerHTML,
          cantidad.innerHTML,
          "green",
          "Agregaste"
        );
        agregarObjetoAlCarrito(nombreTitulo.innerHTML, cantidad.innerHTML);
        representarCarritoYsusObjetosEnHTML();
        modificarCantidadOrigen(
          Items,
          nombreTitulo.innerHTML,
          cantidad.innerHTML
        );
        reiniciarCardEspecifica(Items, element);
        actualizarLocalStorage();
        CalcularYMostrarPrecioTotalDelCarrito();
        darFuncionamientoModal();
      }
    });
  });
}
function reiniciarItemsEnHTML() {
  let lugarEnPantalla = document.querySelectorAll(".cuadradoGrande");
  lugarEnPantalla.forEach((lugar) => lugar.remove());
  cargarInicioAlHTML(Items);
  funcionamientoBotonesIniciales();
}
function buscarTituloTarjetaHTML(lugar) {
  const nombreTitulo =
    lugar.parentElement.parentElement.querySelector(".titulos");
  return nombreTitulo.innerHTML;
}
function buscarPrecio(array, nombreBuscado) {
  const objeto = traerObjetoDelArrayPorNombre(array, nombreBuscado);
  return objeto.precio;
}
function traerObjetoDelArrayPorNombre(array, nombre) {
  const objeto = array.find((objetoItem) => objetoItem.nombre == nombre);
  return objeto;
}
function traerCantidadDelObjetoDelArray(array, nombreBuscado) {
  const objeto = traerObjetoDelArrayPorNombre(array, nombreBuscado);
  return objeto.cantidad;
}
function traerElementoContador(lugar) {
  let campoContador = lugar.parentElement.querySelector(".contador");
  return campoContador;
}
function modificarCantidadOrigen(array, nombreBuscado, cantidadRestar) {
  const objeto = traerObjetoDelArrayPorNombre(array, nombreBuscado);
  objeto.cantidad = objeto.cantidad - cantidadRestar;
}
function reiniciarCardEspecifica(array, lugar) {
  const objeto = traerObjetoDelArrayPorNombre(
    array,
    buscarTituloTarjetaHTML(lugar)
  );
  let nuevaCantidad = objeto.cantidad;
  let donde = lugar.parentElement.parentElement.querySelector(".cantidad");
  donde.innerHTML = `Cantidad disponible: ${nuevaCantidad}`;
  let donde2 = lugar.parentElement.parentElement.querySelector(".contador");
  donde2.innerHTML = `0`;
}
function CalcularYMostrarPrecioTotalDelCarrito() {
  let total = 0;
  Carrito.forEach((element) => {
    total = total + element.precio * element.cantidad;
  });
  objeto = document.getElementById("totalCarrito");
  objeto.innerHTML = `Total: ${total}`;
}
function textoTotalCompra() {
  let total = 0;
  Carrito.forEach((element) => {
    total = total + element.precio * element.cantidad;
  });
  return `Total a pagar:$ ${total}`;
}
function darFuncionamientoModal() {
  const btnFinalizar = document.querySelector("#btnFinalizar");
  const btnVolver = document.querySelector("#btnVolver");
  const textEmail = document.querySelector("#textEmail");
  const textComentario = document.querySelector("#textComentario");
  const tituloEmail = document.querySelector(".tituloEmail");
  //Validar un email que tenga @ y .com si no es valido pinto de rojo sino verde
  textEmail.addEventListener("input", () => {
    if (
      /^([\da-z_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(textEmail.value)
    ) {
      tituloEmail.style.backgroundColor = "rgba(0,255,0,0.5)";
    } else {
      tituloEmail.style.backgroundColor = "rgba(255,0,0,0.5)";
    }
  });
  btnFinalizar.addEventListener("click", () => {
    console.log(btnFinalizar);
  });
  btnVolver.addEventListener("click", () => {
    console.log(btnVolver);
  });
}
function actualizarLocalStorage() {
  if (localStorage.length > 0) {
    localStorage.removeItem("carrito");
    localStorage.removeItem("ItemsOrigen");
    localStorage.setItem("carrito", JSON.stringify(Carrito));
    localStorage.setItem("ItemsOrigen", JSON.stringify(Items));
  } else {
    localStorage.setItem("carrito", JSON.stringify(Carrito));
    localStorage.setItem("ItemsOrigen", JSON.stringify(Items));
  }
}
// EL TOASTIFY
function AvisoTemporal(nombre, cantidad, color, mensaje) {
  Toastify({
    text: `${mensaje} ${cantidad} de ${nombre} al carrito`,
    duration: 3000,
    backgroundColor: `${color}`,
  }).showToast();
}
function cartelEnHTML(tipo, mensaje) {
  Swal.fire({
    position: "center",
    icon: tipo,
    title: mensaje,
    showConfirmButton: false,
    timer: 1500,
  });
}
function cargarInicioAlHTML(array) {
  array.forEach((element) => {
    let lista = document.getElementById("s1");
    lista.insertAdjacentHTML(
      "beforeend",
      `
            <div class="card-group cuadradoGrande">
                <div class="card">
                <img src="${element.imagen}" class="card-img-top" alt="...">
                  <div class="card-body cuadradoItem">
                    <h5 class="card-title titulos">${element.nombre}</h5>
                    <p class="card-text precio">Precio:$${element.precio}</p>
                    <p class="card-text cantidad"> Cantidad disponible:${element.cantidad}</p>
                    <div class="btn-group mr-2" role="group" aria-label="First group">
                    <button type="button" class="btn btn-secondary botonSumar">+</button>
                    <button type="button" class="btn btn-secondary botonRestar">-</button> <p type="text" class = "card-text contador">0</p>
                  </div>
                <button type="button" class="btn btn-info agregar">Agregar</button>
                </div>
            </div>
                `
    );
  });
}
function representarCarritoYsusObjetosEnHTML() {
  let lugar = document.getElementById("s1");
  lugar.insertAdjacentHTML(
    "afterend",
    `
          <div class="card-group" id="este" >
              <div class="card">
                <div class="card-body" id="listado">
                  <h5 class="card-title elegidos">Mis elegidos</h5>
                </div>
                <h5 class="card-title totalLista" id="totalCarrito">Total $0</h5>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Ir al finalizar
          </button>
          <!-- Modal -->
          <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Pago</h5>
                  <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  ${textoTotalCompra()}
                  <div class="mb-3">
      <label for="textEmail" class="form-label tituloEmail">Ingrese su email (debe estar en verde para ser valido)</label>
      <input type="email" class="form-control" id="textEmail" placeholder="name@example.com">
    </div>
    <div class="mb-3">
      <label for="textComentario" class="form-label tituloComentario">Comentarios</label>
      <textarea class="form-control" id="textComentario" rows="3"></textarea>
    </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="btnVolver" data-bs-dismiss="modal">Volver</button>
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="btnFinalizar">Finalizar</button>
                </div>
              </div>
            </div>
          </div> 
              </div>
          </div>
            `
  );
  Carrito.forEach((element) => {
    let lugar = document.querySelector(".elegidos");
    lugar.insertAdjacentHTML(
      "afterend",
      `
              <div class="esto1">
                  <p class="card-text nombreCarrito">${element.nombre}</p>
                  <p class="card-text"> Cantidad seleccionada:${
                    element.cantidad
                  }</p>
                  <p class="card-text"> Subtotal:$${
                    element.cantidad * element.precio
                  }</p>
                  <button type="button" class="btn btn-info cancelarCarrito">Cancelar</button>
              </div>
              `
    );
  });
  //}
  document.querySelector(
    ".totalLista"
  ).innerHTML = `Total $${textoTotalCompra()}`;
  // BOTON CANCELAR y su configuracion
  const botonCancelar = document.querySelectorAll(".cancelarCarrito");
  botonCancelar.forEach((card) => {
    card.addEventListener("click", () => {
      let lugarContenido = card.closest(".esto1");
      let papaLugarContenido = card.closest("#este");
      let nombreContenido = lugarContenido.firstElementChild.innerHTML;
      let objetoEnCarrito = traerObjetoDelArrayPorNombre(
        Carrito,
        nombreContenido
      );
      modificarCantidadOrigen(
        Items,
        objetoEnCarrito.nombre,
        -objetoEnCarrito.cantidad
      );
      let posicionEnCarrito = Carrito.indexOf(objetoEnCarrito);
      Carrito.splice(posicionEnCarrito, 1);
      actualizarLocalStorage();
      lugarContenido.remove();
      AvisoTemporal(
        objetoEnCarrito.nombre,
        objetoEnCarrito.cantidad,
        "red",
        "Eliminaste"
      );
      CalcularYMostrarPrecioTotalDelCarrito();
      reiniciarItemsEnHTML();
      if (Carrito.length == 0) {
        papaLugarContenido.remove();
      }
    });
  });
  salirModal();
}
function agregarObjetoAlCarrito(nombreNuevo, cantidad) {
  // Si no hay nada lo agrego de una
  if (Carrito.length == 0) {
    Carrito.push(
      new eCarrito(nombreNuevo, cantidad, buscarPrecio(Items, nombreNuevo))
    );
  } else {
    //Borro el carrito viejo
    lugar = document.querySelector("#este");
    lugar.remove();
    //si hay algo me fijo si tiene el mismo nombre asi lo sumo al mismo
    const objeto = Carrito.find(
      (objetoItem) => objetoItem.nombre == nombreNuevo
    );
    if (objeto == null || objeto.nombre != nombreNuevo) {
      Carrito.push(
        new eCarrito(nombreNuevo, cantidad, buscarPrecio(Items, nombreNuevo))
      );
    } else {
      objeto.cantidad = parseInt(objeto.cantidad) + parseInt(cantidad);
    }
  }
}

function salirModal() {
const btn = document.getElementById("btnFinalizar");
const textEmail = document.getElementById("textEmail");
const textComentario = document.getElementById("textComentario");
btn.addEventListener("click", ()=>{
cartelEnHTML("success", `Gracias por su compra, se envio un mail a ${textEmail.value} tendremos en cuenta el comentario "${textComentario.value}"`);
//falta refrescar la pagina.
Carrito.splice(0, Carrito.length);
actualizarLocalStorage();
let papaLugarContenido = document.getElementById("este");
papaLugarContenido.remove();
})
}
