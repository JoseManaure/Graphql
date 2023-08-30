import React from 'react';
import Swal from 'sweetalert2';
import { gql , useMutation } from '@apollo/client';
import Router from 'next/router';

const ELIMINAR_CLIENTE = gql`
mutation eliminarCliente($id: ID!){
    eliminarCliente(id:$id)
}
`;

const OBTENER_CLIENTES_USUARIO = gql`
    query obtenerClientesVendedor {
        obtenerClientesVendedor {
            id
            nombre
            apellido
            empresa
            email
        }
    }
`;

    const Cliente = ({cliente}) => {
    // Mutation pra eliminar productos
    const [ eliminarCliente ] = useMutation (ELIMINAR_CLIENTE, {
        update(cache){
        // Obtener una capia del objecto de cache
        const {obtenerClientesVendedor } = cache.readQuery({query: OBTENER_CLIENTES_USUARIO});
        // Reescribir el cache
        cache.writeQuery({
            query: OBTENER_CLIENTES_USUARIO,
            data: {
                obtenerClientesVendedor: obtenerClientesVendedor.filter( clienteActual => clienteActual.id !== id)
            }
        })
        
        }
    });

    const { nombre, apellido, empresa, email, id } = cliente;
    // console.log(id);

    //  Eliminar un cliente 
    const confirmarEliminarCliente = () => {
    console.log('Eliminando', id);

    Swal.fire({
        title:'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButton: '#d33',
        confirmButtonText: 'Yes, delete it'
    }).then(async (result) =>{
        if(result.value){
            try {
                //Eliminar por ID
            const { data } = await eliminarCliente({
                variables: {
                    id
                }
            });
          //  console.log(data);
                //Mostrar una alerta
            Swal.fire(
                'Deleted!',
                data.eliminarCliente,
                'success'
            )
            } catch (error) {
                console.log(error);
            }

        }
    })
}
    const editarCliente = () => {
        Router.push({
        pathname: "/editarcliente/[id]",
        query: { id }
    })
    }
    return (
        <tr>
            <td className="border px-4 py-2"> {cliente.nombre} {cliente.apellido} </td>
            <td className="border px-4 py-2"> {cliente.empresa} </td>
            <td className="border px-4 py-2"> {cliente.email} </td>
            <td className="border px-4 py-2"> 
                    <button
                    type="button"
                    className="flex justify-center items-center bg-red-800 py-2 px-4 w-full text-white rounded text-xs uppercase font-bold "
                    onClick={() => confirmarEliminarCliente()}
                    >
                Eliminar
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"></path>
                </svg>
                </button>
            </td>
            <td className="border px-4 py-2"> 
                    <button
                    type="button"
                    className="flex justify-center items-center bg-green-600 py-2 px-4 w-full text-white rounded text-xs uppercase font-bold "
                   onClick={() => editarCliente()}
                    >
                Editar
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
</svg>
                </button>
            </td>
        </tr>
        );
}

export default Cliente;