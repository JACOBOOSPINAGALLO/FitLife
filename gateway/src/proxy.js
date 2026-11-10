// Devuelve un middleware que reenvía la petición a un microservicio
module.exports = (baseUrl, prefijo) => async (req, res) => {
  const url = `${baseUrl}/${prefijo}${req.url}`;

  const opciones = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (req.headers.authorization) opciones.headers.Authorization = req.headers.authorization;
  if (!['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length) {
    opciones.body = JSON.stringify(req.body);
  }

  try {
    const respuesta = await fetch(url, opciones);
    const texto = await respuesta.text();
    res.status(respuesta.status).type('application/json').send(texto);
  } catch {
    res.status(503).json({ error: `El servicio de ${prefijo} no está disponible` });
  }
};