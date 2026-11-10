require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const register = client.register;

client.collectDefaultMetrics({ labels: { service: 'planes' } });

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
app.use('/planes', require('./routes/plan.routes'));

if (require.main === module) {
  app.listen(process.env.PORT, () => {
    console.log(`✅ Planes-service corriendo en http://localhost:${process.env.PORT}`);
  });
}

module.exports = app;