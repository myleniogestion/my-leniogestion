const axios = require("axios");

const host = "http://147.93.128.46:3000";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjozMiwibm9tYnJlIjoiRGF2aWQiLCJpYXQiOjE3Mzc4NzI3NDUsImV4cCI6MTczNzg5MDc0NX0.BO_IxXgE5rq87CVOCdEMY_Elvyyc8Bg1-YToOB9XCa4";

// Recive las entradas de un producto y devuelve el costo promedio de ese producto
const calcularPromedioAcomulado = (
  entradas,
  cantidadEnLaEmpresa
) => {
  let cantidad_existencia = 0;
  let costo_promedio = 0;
  let cantidadVendida = 0;

  // Sacar cantidad vendida
  entradas.forEach((entrada) => {
    cantidadVendida += entrada.cantidad;
  });
  cantidadVendida = cantidadVendida - cantidadEnLaEmpresa;
  
  entradas.forEach((entrada) => {
    let entradaActual = entrada;

    if (parseInt(entradaActual.cantidad) > cantidadVendida) {
      entradaActual.cantidad -= cantidadVendida;
      cantidadVendida = 0;
      let costo_i = parseFloat(entradaActual.costo);
      let cantidad_i = parseFloat(entradaActual.cantidad);
      costo_promedio =
        (cantidad_existencia * costo_promedio + cantidad_i * costo_i) /
        (cantidad_existencia + cantidad_i);
      cantidad_existencia = cantidad_existencia + cantidad_i;
    } else {
      cantidadVendida -= parseInt(entradaActual.cantidad);
    }
  });

  return costo_promedio.toFixed(5);
}

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

const getAllServicio = async (token) => {
    try {
        const response = await axios.get(`${host}/Servicio`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener servicio: ", error);
        return false;
    }
};

const getVentaByIdServicio = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Venta/getbyServicio/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error al obtener venta por servicio: ", error);
        return false;
    }
};

const getProductoCantidadTotal = async (token, id) => {
    try {
        const response = await axios.get(`${host}/Producto_tienda/getCantidadTotal/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data.cantidad_total;
    } catch (error) {
        console.log("Error al obtener venta por servicio: ", error);
        return false;
    }
};

const updateServicioCosto = async (token, id, costo) => {
    try {
        const response = await axios.put(
              `${host}/Servicio/updateServicio/${id}`,
              {
                costo: costo
              },
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
            );
        return response.data;
    } catch (error) {
        console.log("Error al actualizar servicio: ", error);
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

(async () =>{
    console.log("Opteniendo datos de servicios");
    
    const resultAllServicios = await getAllServicio(token);

    for(servicio of resultAllServicios){
        if (
            servicio.tipo_servicio.id_tipo_servicio === 2 ||
            servicio.tipo_servicio.id_tipo_servicio === 4 ||
            servicio.tipo_servicio.id_tipo_servicio === 25
        ) {
            const resultVenta = await getVentaByIdServicio(token, servicio.id_servicio)
            const cantidadTotalProducto = await getProductoCantidadTotal(token, resultVenta.producto.id_producto)
            const resultEntradas = await getAllEntradasByProducto(token, resultVenta.producto.id_producto)

            const costoPromedio = calcularPromedioAcomulado(resultEntradas, cantidadTotalProducto);

            if (servicio.costo !== costoPromedio) {
                await updateServicioCosto(token, servicio.id_servicio, costoPromedio);
            }
            console.log("IDP: ",resultVenta.producto.id_producto," IDS: ", resultVenta.servicio.id_servicio," : ",costoPromedio, " -> ", (servicio.costo !== costoPromedio));
        }
    }
})();
// Llamar a la función y manejar la respuesta
/*(async () => {
    console.log("Obteniendo productos");
    const resultAllProductos = await getAllProductos(token)
    const resultMovimientos = await getAllMovimientos(token)

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
})();*/