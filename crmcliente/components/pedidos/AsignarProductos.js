import React, {useEffect, useState, useContext} from 'react'
import Select from 'react-select'
import{ gql, useQuery } from '@apollo/client';
import PedidoContext from '../../context/pedidos/PedidoContext';

const OBTENER_PRODUTOS =  gql`
    query obtenerProductos {
    obtenerProductos {
        id
        nombre
        precio
        existencia
    }
}
`

const AsignarProductos = () => {

    // state local del componente
    const [productos, setProductos] = useState([]);

    // Contex de pedidos
    const pedidoContext = useContext(PedidoContext)
    const { agregarProducto } = pedidoContext;
    
    // consulta a la base de datos

    const { data, loading, error} = useQuery(OBTENER_PRODUTOS);
    
    useEffect(() => {
        // TODO : Funcion para pasar a PedidoState
       agregarProducto(productos);
    }, [productos])
    // console.log(data);
    // console.log(loading);
    // console.log(error);

    const seleccionarProducto = producto =>{
        setProductos(producto)
    }

    if(loading) return null;
    const {obtenerProductos} = data;


    return (
        <>
                
        <Select
            className= 'mt-3'
            options= { obtenerProductos }
            onChange = {opcion  => seleccionarProducto(opcion)}
            isMulti = {true}
            getOptionValue = { opciones =>opciones.id }
            getOptionLabel = { opciones => `${opciones.nombre} - ${opciones.existencia} Disponibles`}
            placeholder= "Busque o seleccione el Producto"
            noOptionsMessage = {() => "No hay resultados"}
         />
         </>
    );
}

export default AsignarProductos;