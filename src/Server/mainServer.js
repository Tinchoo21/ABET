
const express = require('express');
const app = express();
const path = require('path');
const mime = require('mime');
const client = require('../Database/database')
const bodyParser = require('body-parser');
const session = require('express-session');


client.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Error connecting to the database', err));


app.get('/', (req, res) => {

    const location = path.join(__dirname, '..','Index' ,'index.html')

    res.sendFile(location);

});

app.get('/index.css', (req, res) => {

    const location = path.join(__dirname, '..','Index' ,'index.css')

    res.sendFile(location);

});
app.get('/index.js', (req, res) => {

    const location = path.join(__dirname, '..','Index' ,'index.js')

    res.sendFile(location);

});

app.get('/abetlogo.png', (req, res) => {

    const location = path.join(__dirname, '..', 'Images', 'abetlogo.png')
    res.sendFile(location);
});
app.get('/hide.png', (req, res) => {

    const location = path.join(__dirname, '..', 'Images', 'hide.png')
    res.sendFile(location);
});
app.get('/show.png', (req, res) => {

    const location = path.join(__dirname, '..', 'Images', 'show.png')
    res.sendFile(location);
});

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.listen(5000, () => {
    console.log('Express.js server listening on port 3000');
});

app.use(bodyParser.urlencoded({ extended: false }));

exports.app = app
exports.client = client

const loginServer = require('./loginServer')