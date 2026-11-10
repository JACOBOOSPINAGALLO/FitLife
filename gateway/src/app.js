require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const autenticar = require('./middleware/auth');
const proxy = require('./proxy');

const app = express();
const register = client.register;

client.collectDefaultMetrics({ labels: { service: 'gateway' } });

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests handled by this service',
  labelNames: ['method', 'route', 'status']
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route
      ? `${req.baseUrl}${req.route.path}`
      : `${req.baseUrl}${req.path.replace(/\/\d+(?=\/|$)/g, '/:id')}`;
    requestCounter.inc({ method: req.method, route, status: String(res.statusCode) });
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

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

if (require.main === module) {
  app.listen(process.env.PORT, () => {
    console.log(`✅ API Gateway corriendo en http://localhost:${process.env.PORT}`);
    console.log(`📁 Sirviendo frontend desde: ${path.join(__dirname, '../../frontend')}`);
  });
}

module.exports = app;