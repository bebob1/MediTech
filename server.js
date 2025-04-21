const app = require('./src/app');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});