import React, { useReducer} from 'react'
import PedidoContext from './PedidoContext';
import PedidoReducer from './PedidoReducer';

import {
    SELECCIONAR_CLIENTE,
    SELECCIONAR_PRODUCTO,
    CANTIDAD_PRODUCTOS,
    ACTUALIZAR_TOTAL
} from '../../types'

const PedidoState = ({children}) => {

    // State de pedidos
    const initialState = {
        cliente: {},
        productos: [],
        total: 0
    }

    // Modifica el Cliente
    const agregarCliente = cliente => {

        console.log(cliente);

        dispatch({
            type: SELECCIONAR_CLIENTE,
            payload: cliente
        })
    }


        // Modifica  los productos 
        const agregarProducto = productosSeleccionados =>{

                let nuevoState;
                if(state.productos.length > 0 ) {
                    // Tomar de segundo arreglo una copia para asignarlo al primero
                        nuevoState = productosSeleccionados.map( producto =>{
                            const  nuevoObjecto = state.productos.find(  productoState => productoState.id === producto.id );
                            return {...producto, ...nuevoObjecto}
                        }); 
                }else{
                    nuevoState = productosSeleccionados;
                }

            dispatch ({
                type: SELECCIONAR_PRODUCTO,
                payload : nuevoState
            })
        }

        // Modifica las cantidades de los productos
        const cantidadProductos = nuevoProducto => {
           dispatch({
               type: CANTIDAD_PRODUCTOS, 
               payload: nuevoProducto
           })
        }

        const actualizarTotal = () => {
         dispatch({
             type: ACTUALIZAR_TOTAL
         })
        }

    const [ state, dispatch ] = useReducer(PedidoReducer, initialState);

    // const holaMundoUseReducer = () => {
    //     console.log('hola mundo')
    // }

    return (
        <PedidoContext.Provider
        value= {{
            cliente: state.cliente,
            productos: state.productos,
            total: state.total,
            agregarCliente,
            agregarProducto,
            cantidadProductos,
            actualizarTotal
        }}
        > {children}
                
        </PedidoContext.Provider>
    )
}
export default PedidoState;