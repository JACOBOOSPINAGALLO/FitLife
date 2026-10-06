require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/membresias', require('./routes/membresia.routes'));

app.listen(process.env.PORT, () => {
  console.log(`✅ Membresías-service corriendo en http://localhost:${process.env.PORT}`);
});