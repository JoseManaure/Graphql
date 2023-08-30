import React from 'react'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'


    const OBTENER_PRODUCTO = gql`
        query obtenerProducto ($pid: ID!){
             obtenerProducto(id: $pid) {
             nombre
            existencia
            precio
            }
         }
        `;

        const ACTUALIZAR_PRODUCTO = gql`
        mutation actualizarProducto($pid: ID!, $input: ProductoInput){
            actualizarProducto(id: $pid input : $input){
              id
              nombre
              existencia
              precio
          }
          }
        `;

const EditarProducto = () =>{
     // obtener el ID actual
     const router = useRouter();
     const { query: { pid } } = router;
     // console.log(pid);
 
 
     // Consulta para obtener el cliente
     const { data, loading, error} = useQuery(OBTENER_PRODUCTO, {
         variables: {
             pid
         }
     });

     // Mutacion para modificar el producto
     const [ actualizarProducto ] = useMutation(ACTUALIZAR_PRODUCTO)


     // Schema de validacion
     const schemaValidacion = Yup.object({
        nombre: Yup.string()
        .required('El nombre del producto es obligatorio'),
        existencia: Yup.number()
        .required('Agrega la cantidad disponbile')
        .positive('No se acepan numeros negativos')
        .integer('La existencia deben ser numeros enteros'),
        precio: Yup.number()
        // .required('El precio es obligatorio')
        .positive('No se aceptan numeros negativos')
    });
 
    // console.log(data);
    // console.log(loading);
    // console.log(error);

    if(loading)return 'Cargando...';

    if(!data){
        return 'Accion no permitida';
    }

    const actualizarInfoProductos = async valores =>{
        // console.log(valores);
        const {nombre, existencia, precio } = valores;

        try {
            const {data} = await actualizarProducto({
            variables: {
            pid,
            input:{
                nombre, 
                existencia,
                precio
            }
        }
        })
        // console.log(data);

        // Redirigir hacua productos
        router.push('/productos')

        // Mostrar una alerta
        Swal.fire(
            'Correcto',
            'El producto se actualizo correctamente',
            'success'
        )

} catch (error) {
    console.log(error);
}

    }
    
    const { obtenerProducto } = data;

    return (
        <Layout>
                 <h1 className="text-2xl text-gray-800 font-light"> Editar Producto</h1>
                 <div className= "flex justify-center mt-5">
            <div className="w-full max-w-lg">
                    <Formik
                    enableReinitialize
                    initialValues={obtenerProducto}
                    validationSchema = {schemaValidacion}
                    onSubmit= {valores => { 
                        actualizarInfoProductos(valores)
                    }}
                    >

                        {props => {
                            return (

                          
            <form
                className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                onSubmit={props.handleSubmit}
                >
                                <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                                    Nombre
                                </label>

                                <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="nombre"
                                type="text"
                                placeholder="Nombre Producto"
                                onChange={props.handleChange}
                                onBlur= {props.handleBlur}
                                value= {props.values.nombre}
                                />
                        </div>
                        { props.touched.nombre && props.errors.nombre ? (
                              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                  <p className="font-bold">Error</p>
                                  <p> {props.errors.nombre} </p>
                              </div>
                          ) : null}
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="existencia">
                                    Cantidad Diponible
                                </label>
                                
                                <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="existencia"
                                type="number"
                                placeholder="Cantidad Disponible"
                                onChange={props.handleChange}
                                onBlur= {props.handleBlur}
                                value= {props.values.existencia}
                                />
                        </div>
                        { props.touched.existencia && props.errors.existencia ? (
                              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                  <p className="font-bold">Error</p>
                                  <p> {props.errors.existencia} </p>
                              </div>
                          ) : null}
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
                                    Precio
                                </label>

                                <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="precio"
                                type="number"
                                placeholder="Precio Producto"
                                onChange={props.handleChange}
                                onBlur= {props.handleBlur}
                                value= {props.values.precio}
                                />
                        </div>
                        { props.touched.precio && props.errors.precio ? (
                              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                  <p className="font-bold">Error</p>
                                  <p> {props.errors.precio} </p>
                              </div>
                          ) : null}
                           <input 
                        type="submit"
                        className="bg-gray-800 w-full mt-5 p-2 text-white uppercase font-blod hover:bg-gray-900"
                        value="Editar Producto"
                        />
               
                         </form>
                           )
                      }}
                         </Formik>
                       </div>
                   </div>

        </Layout>
    );

}

export default EditarProducto;