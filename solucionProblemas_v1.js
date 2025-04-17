const axios = require("axios");

const host = "http://31.170.165.44:3000";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxLCJub21icmUiOiJEYXZpZCBRdWludGFuYSIsImlhdCI6MTc0NDgzMTA5OCwiZXhwIjoxNzQ0ODQ5MDk4fQ.rHobHyJZSDbkfTmlx79hi7-DitAGKdebYzdMl85_Sm8";

// Obtener todos los productos
const getAllProductos = async (token) => {
    try {
        const response = await axios.get(`${host}/Producto`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener datos de los productos: ", error);
        return false;
    }
};

// Modificar producto tienda
const updateProductoTienda = async (
  token,
  id_producto,
  id_tienda,
  cantidad
) => {
  try {
    await axios.put(
      `${host}/Producto_tienda/updateProducto_tienda`,
      {
        id_producto: id_producto,
        id_tienda: id_tienda,
        cantidad: cantidad
      },
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
  } catch (error) {
    console.log("Error actualizar el producto_tienda: ", error);
    return false;
  }
};

const getProductoById = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Producto/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener datos de los productos: ", error);
        return false;
    }
};

const getAllProductoTienda = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Producto_tienda/getTiendas/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener datos de los producto tienda: ", error);
        return false;
    }
};

const getVentasByProducto = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Venta/getbyProducto/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener datos de las ventas del producto: ", error);
        return false;
    }
};

const getAllEntradasByProducto = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Entrada/Producto/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener datos de los entradasdel producto: ", error);
        return false;
    }
};

const getEntradaById = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Entrada/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener entrada ID: ", error);
        return false;
    }
};

const getServicioById = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Servicio/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener entrada ID: ", error);
        return false;
    }
};

const getAllMovimientos = async (token) => {
    try {
        const response = await axios.get(`${host}/Salida`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener movimientos: ", error);
        return false;
    }
};

// Llamar a la función y manejar la respuesta
(async () => {
    console.log("Obteniendo productos");
    const resultAllProductos = await getAllProductos(token)
    if (!resultAllProductos) {
        console.log("Fallo en obtener productos");
        return
    }
    console.log("Obteniendo movimientos");
    const resultMovimientos = await getAllMovimientos(token)
    if (!resultMovimientos) {
        console.log("Fallo en obtener movimientos");
        return
    }

    if (resultAllProductos && Array.isArray(resultAllProductos)) {
        for (let producto of resultAllProductos) {
            const resultProductoTiendaByProducto = await getAllProductoTienda(token, producto.id_producto)
            const resultVentasByProducto = await getVentasByProducto(token, producto.id_producto)
            if (resultProductoTiendaByProducto && Array.isArray(resultProductoTiendaByProducto)) {
                for (let productoTienda of resultProductoTiendaByProducto) {
                    let sumaCantEntradas = 0
                    let sumaCantMovi = 0
                    let sumaCantVentas = 0

                    // Sumar entradas que coincidan
                    const resultEntradasByProducto = await getAllEntradasByProducto(token, productoTienda.producto.id_producto)
                    if (resultEntradasByProducto && Array.isArray(resultEntradasByProducto)) {
                        for (let entrada of resultEntradasByProducto) {
                            const entradaById = await getEntradaById(token, entrada.id_entrada)
                            if (entradaById.tienda.id_tienda === productoTienda.tienda.id_tienda) {
                                sumaCantEntradas = sumaCantEntradas + entradaById.cantidad
                            }
                        }
                    }

                    // Sumar movimientos a la tienda
                    if (resultMovimientos && Array.isArray(resultMovimientos)) {
                        for (let movimiento of resultMovimientos) {
                            if (movimiento.producto.id_producto === productoTienda.producto.id_producto &&
                                movimiento.tienda_destino.id_tienda === productoTienda.tienda.id_tienda) {
                                sumaCantMovi = sumaCantMovi + parseInt(movimiento.cantidad)
                            }
                            if (movimiento.producto.id_producto === productoTienda.producto.id_producto &&
                                movimiento.tienda_origen.id_tienda === productoTienda.tienda.id_tienda) {
                                sumaCantMovi = sumaCantMovi - parseInt(movimiento.cantidad)
                            }
                        }
                    }

                    // Suma de la cantidad vendida
                    if (resultVentasByProducto && Array.isArray(resultVentasByProducto)) {
                        for (let venta of resultVentasByProducto) {
                            const resultServicioByVenta = await getServicioById(token, venta.servicio.id_servicio)
                            if (resultServicioByVenta.tienda.id_tienda === productoTienda.tienda.id_tienda) {
                                sumaCantVentas = sumaCantVentas + parseInt(venta.cantidad)
                            }
                        }
                    }



                    if ((sumaCantEntradas + sumaCantMovi - sumaCantVentas) !== parseInt(productoTienda.cantidad)) {
                        console.log("ID: ", productoTienda.producto.id_producto, " - ", productoTienda.producto.nombre, " - ", productoTienda.tienda.nombre);
                        console.log("  Entradas: ",sumaCantEntradas);
                        console.log("  Movimientos: ",sumaCantMovi);
                        console.log("  Ventas: ",sumaCantVentas);
                        console.log("  Existencia: ",productoTienda.cantidad);
			console.log("  Dede tener -> ", (sumaCantEntradas + sumaCantMovi - sumaCantVentas));

                        //await updateProductoTienda(token, productoTienda.producto.id_producto, productoTienda.tienda.id_tienda, (sumaCantEntradas + sumaCantMovi - sumaCantVentas))
                    }
                    sumaCantEntradas = 0
                    sumaCantMovi = 0
                    sumaCantVentas = 0
                }
            }
        }
    } else {
        console.log("Error al obtener todos los productos");
    }
})();