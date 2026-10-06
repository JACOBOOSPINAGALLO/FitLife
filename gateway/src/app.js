require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const autenticar = require('./middleware/auth');
const proxy = require('./proxy');

const app = express();
app.use(cors());
app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Usuarios: solo register y login son públicos; el resto exige JWT
app.use(
  '/api/usuarios',
  (req, res, next) => {
    const esPublica = req.method === 'POST' && ['/register', '/login'].includes(req.path);
    return esPublica ? next() : autenticar(req, res, next);
  },
  proxy(process.env.USUARIOS_URL, 'usuarios')
);

// Planes y membresías: todo exige JWT
app.use('/api/planes', autenticar, proxy(process.env.PLANES_URL, 'planes'));
app.use('/api/membresias', autenticar, proxy(process.env.MEMBRESIAS_URL, 'membresias'));

app.listen(process.env.PORT, () => {
  console.log(`✅ API Gateway corriendo en http://localhost:${process.env.PORT}`);
  console.log(`📁 Sirviendo frontend desde: ${path.join(__dirname, '../../frontend')}`);
});