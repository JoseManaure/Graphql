const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
  
        });
        console.log('db conectado');
    }catch (error){
        console.log('hubo un errror');
        console.log(error);
        process.exit(1); //detener la app
    }
}
module.exports = conectarDB;