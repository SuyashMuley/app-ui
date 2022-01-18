const express = require('express');
const bodyParser = require('body-parser');
const { response } = require('express');
const { json } = require('body-parser');
const app = express();
const port =  5000;
const PORT = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '1mb'}));
app.use(express.urlencoded({ extended: false }));

app.post('/api/state/cache',(request, response) => {
  console.log(request.body);
});
app.listen(port, () => console.log(`Listening on port ${port}`));

