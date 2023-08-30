const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');
const bcryptjs = require ('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) =>{
    console.log(usuario);
    const {id , email, nombre, apellido } = usuario;
    return jwt.sign({ id,email, nombre,apellido }, secreta, { expiresIn} )
}
        // Resolvers
        const resolvers = {
                Query: {
                    obtenerUsuario: async (_, {  }, ctx) =>{
                    return ctx.usuario
                    },
                    obtenerProductos: async () =>{
                    try {
                    const productos = await Producto.find({});
                
                       return productos;

                    } catch (error) {
                console.log(error);    
                    }
                },
                obtenerProducto: async (_, { id }) =>{
                       // Revisar si el producto existe o no
                       const producto = await Producto.findById(id);
                       if(!producto){
                           throw new Error('Producto no encontrado')
                       } 

                       return producto;
                },
                obtenerClientes: async () =>{
                    try {
                        const clientes = await Cliente.find({})
                        return clientes;
                    } catch (error) {
                        console.log(error);
                    }
                },
                obtenerClientesVendedor: async (_,{}, ctx)=>{
                    try {
                        const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()})
                        console.log(clientes);
                        return clientes;
                    } catch (error) {
                        console.log(error);
                    }
                },
                obtenerCliente: async(_, {id}, ctx)=>{
                // Revisar si el Cliente existe o no
                    const cliente = await Cliente.findById(id);
                    console.log(id);
                    if(!cliente){
                        throw new Error ('Cliente no encontrado');
                    }

                // Quien lo creo puede verlo
                if(cliente.vendedor.toString() !== ctx.usuario.id){
                    throw new Error ('No tienes la credenciales');

                }
                    return cliente;
                },
                obtenerPedidos: async ()=>{
                    try {
                        const pedidos = await Pedido.find({});
                        return pedidos
                    } catch (error) {
                        console.log(error);
                    }
                },
                obtenerPedidosVendedor: async (_, {}, ctx) =>{
                    try {
                        const pedidos = await Pedido.find({vendedor: ctx.usuario.id}).populate('cliente');
                        return pedidos
                    } catch (error) {
                        console.log(error);
                    }
                },
                obtenerPedido: async (_, {id}, ctx)=>{
                    //Si el pedido existe o no
                        const pedido = await Pedido.findById(id)
                        if(!pedido){
                            throw new Error('Pedido no encontrado')
                        }

                        // Solo quien lo creo puede verlo
                        if(pedido.vendedor.toString() !== ctx.usuario.id){
                            throw new Error ('No tienes la credenciales');

                        }
                    // Retornar el resultado
                        return pedido;
                },
                obtenerPedidosEstado: async (_, {estado}, ctx)=>{
                    console.log(ctx.usuario.id);
                    const pedidos = await Pedido.find({vendedor: ctx.usuario.id, estado})
                    return pedidos;
                 },
                     mejoresClientes: async () => {
                     const clientes = await Pedido.aggregate([
                    { $match: { estado : "COMPLETADO" } },
                    { $group:  {
                        _id : "$cliente",
                        total: { $sum: 'total'}
                        }},
                        {
                       $lookup: {
                         from: 'clientes',
                        localField : '_id',
                         foreignField: "_id",
                         as: "cliente"
                            }
                        },
                        {
                            $limit: 10
                        },
                        {
                            $sort: { total: - 1}
                        }
                    ]);

                    return clientes;
                },
                mejoresVendedores: async () =>{
                    const vendedores = await Pedido.aggregate([
                        { $match : {estado : 'COMPLETADO'} },
                            { $group: {
                                    _id: '$vendedor',
                                    total: {$sum: "total"}
                                    }},
                                    {
                                        $lookup: {
                                            from: 'usuarios',
                                            localField: '_id',
                                            foreignField: '_id',
                                            as:'vendedor'
                                        }
                                    },
                                    {
                                        $limit: 3
                                    },
                                    {
                                        $sort: {total: -1}
                                    }
                    ]);
                    return vendedores; 
                },
                buscarProducto: async(_,{texto})=>{
                    const producto = await Producto.find({ $text: { $search: texto }}).limit(10)
                    return producto;
                }
            },
                Mutation: {
                    nuevoUsuario: async (_, { input } ) => {
                   const { email, password } = input;
            
                //Revisar si el usuario ya esta registrado
                const existeUsuario = await Usuario.findOne({email}) 
            if( existeUsuario ){
                throw new Error ('El usuario ya esta registrado');
            }

            // Hashear su password
           const salt = await bcryptjs.genSaltSync(10);
           input.password = await bcryptjs.hash(password, salt);

           try{ 
            // Guardar en la base de datos
               const usuario = new Usuario(input);
               usuario.save(); //guardarlo
               return usuario;

            } catch(error ){
               console.log(error);
              }
             },
            autenticarUsuario: async (_, {input}) =>{
                 const {email, password } = input;

                 // Si el ususario existe
                const existeUsuario = await Usuario.findOne({email});
                if(!existeUsuario ){
                    throw new Error ('El usuario ya esta registrado');
                }

                // Revisar si el password es correcto 
                const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
                if(!passwordCorrecto){
                    throw new Error('El password es Incorrecto');

                }

                // Crear el token
                    return {
                        token: crearToken(existeUsuario,process.env.SECRETA, '24h')
                    }

                },
                nuevoProducto: async (_, {input }) =>{
             try {
                const producto =  new Producto(input);
     
                // almacenar en la base de datos
                const resultado = await producto.save()
                return resultado;
                
                } catch (error) {
                console.log(error);
                }
                 },
                 actualizarProducto: async (_, {id ,input}) =>{
                     // Revisar si el producto existe o no
                     let producto = await Producto.findById(id);

                     if(!producto){
                         throw new Error('Producto no encontrado');
                     }

                     // Guardar en la base de datos
                     producto = await Producto.findOneAndUpdate ({ _id : id }, input ,{ new: true} );

                     return producto;

                 },
                 eliminarProducto: async(_, {id}) =>{
                      // Revisar si el producto existe o no
                      let producto = await Producto.findById(id);

                      if(!producto){
                          throw new Error('Producto no encontrado');
                      }

                      //Eliminar
                      await Producto.findOneAndDelete({_id : id});

                      return "Producto Eliminado"
                 },
                 nuevoCliente: async (_, { input }, ctx) =>{
                     const { email } = input
                     // Verfificar si el cliente ya esta o 
                       console.log(input);

                       const cliente = await Cliente.findOne ({email});
                       if(cliente){
                          throw new Error('Ese cliente ya esta registrado');
                                  }

                            const nuevoCliente = new Cliente(input);

                            // Asiganar el vendedor
                            nuevoCliente.vendedor = ctx.usuario.id;
                            // Guardar en la base de datos
                       
                         try {
                            const resultado = await nuevoCliente.save();
                            return resultado;                             
                          } catch (error){
                        console.log(error);
                         }
                      },
                        actualizarCliente: async (_, {id, input}, ctx)=>{
                          // Verificar si existe o no
                            let cliente = await Cliente.findById(id)

                            if(!cliente){
                                throw new Error('ese cliente no existe')
                            }
                          // Verificar si es e vendedor quien lo edita
                            if(cliente.vendedor.toString() !== ctx.usuario.id){
                        throw new Error ('No tiene las credenciales')
                            }
                          // Guardar el Cliente
                          cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
                          return cliente; 
                            },
                            eliminarCliente: async (_, {id, input }, ctx) =>{
                                const cliente = await Cliente.findById(id);

                            if(!cliente){
                                throw new Error ('No existe ese cliente');
                            }

                            // Verificar si el vendedor es quien edita
                            if(cliente.vendedor.toString() !== ctx.usuario.id){
                                throw new Error('No tienes las credenciales')
                            }

                            // Eliminar Cliente
                            await Cliente.findOneAndDelete({_id : id})
                            return "Cliente eliminado"
                            },
                         nuevoPedido: async (_, {input} , ctx )=>{
                          const { cliente } = input;
                         // Verificar si cliente existe o no
                        let clienteExiste =  await Cliente.findById(cliente);
                        if(!clienteExiste){
                            throw new Error ('Ese cliente no existe');
                        }
                           // Verificar si el cliente es del vendedor
                        if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
                            throw new Error ('No tiene las credenciales')
                        }
                         // Revisar que el stock este disponible
                         for await (const articulo of input.pedido){
                          const { id } = articulo;

                         const producto = await Producto.findById(id);

                        if (articulo.cantidad > producto.existencia){
                        throw new Error (`El articulo: ${producto.nombre} exceda la cantidad disponible`)
                                    } else {
                         producto.existencia = producto.existencia - articulo.cantidad;
                           await  producto.save();
                                  }
                                 }
                                    // Crear un nuevo pedido
                                   const nuevoPedido = new Pedido (input);
                                     
                                    // Asignarle un vendedor
                                    nuevoPedido.vendedor = ctx.usuario.id
                                    // Guardar en la base de datos
                                    const resultado = await nuevoPedido.save();
                                    return resultado;
                                    
                            },
                            actualizarPedido: async (_, {id, input} , ctx)=>{
                                const {cliente }  = input;
                                // Si el pedido existe
                                const existePedido = await Pedido.findById(id);
                                if(!existePedido) {
                                    throw new Error ('El pedido no existe')
                                }

                                // Si el cliente existe
                                const existeCliente = await Cliente.findById(cliente);
                                if(!existeCliente) {
                                    throw new Error ('El Cliente no existe')
                                }

                                // Si el cliente y pedido pertenece al vendedor
                                if(existeCliente.vendedor.toString() !== ctx.usuario.id){
                                    throw new Error('No tienes las credenciales');
                                }
                                // Revisar el stock
                                for await (const articulo of input.pedido){
                                    const {id } = articulo;

                                    const producto = await Producto.findById(id);

                                    if(articulo.cantidad > producto.existencia){
                                        throw new Error ( `El articulo: ${producto.nombre} excede la cantidad disponible`);

                                    }else{
                                        // Restar la cantidad a lo disponible
                                        producto.existencia= producto.existencia - articulo.cantidad;
                                        await Producto.save();
                                    }
                                }

                                // Guardar el pedido\
                                const resultado = await Pedido.findOneAndUpdate({_id: id }, input, { new :true})
                                return resultado

                            },
                            eliminarPedido: async(_, {id}, ctx ) =>{
                                // Verificar si el pedido existe o no
                                const pedido = await Pedido.findById(id);
                                if(!pedido){
                                    throw new Error (' El pedido no existe')
                                }
                                  
                                // Verificar si el vendedor es quien lo borra
                                if(pedido.vendedor.toString() !== ctx.usuario.id){
                                    throw new Error('No tienes las credenciales')
                                } 

                            // Eliminar de la base de datos
                            await Pedido.findOneAndDelete({_id : id});
                            return "Pedido Eliminado"
                                }

                            }
                        }

        module.exports = resolvers;