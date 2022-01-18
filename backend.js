import express from 'express';
var app = express();

app.post('/', function(req, res){
   console.log(res.body, req);
});

app.listen(5000);
