const express = require('express');
const path = require('path');
const serveIndex = require('serve-index')

var app = express();

app.use('/public', express.static(__dirname + '/webapp/resources'), serveIndex(__dirname + "/webapp/resources",{ 'icons': true }));

app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname, '/webapp/', 'index.html'));
});

app.listen(3000, ()=>{ console.log("Aplicativo iniciado") });