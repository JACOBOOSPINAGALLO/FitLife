require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/planes', require('./routes/plan.routes'));

app.listen(process.env.PORT, () => {
  console.log(`✅ Planes-service corriendo en http://localhost:${process.env.PORT}`);
});