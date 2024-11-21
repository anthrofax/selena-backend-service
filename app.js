const express = require('express');
const bodyParser = require('body-parser');

const router = require('./routes/routes');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(router);

const PORT = process.env.PORT || 8000;
app.listen(PORT);