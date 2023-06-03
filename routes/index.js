var express = require('express');
const db = require('../database');
var router = express.Router();
const nodemailer = require('nodemailer');
const request = require ('request');
require ('dotenv').config(); 



/* GET home page. */
router.get('/', function(req, res, next) {
  let name = 'Alexander Almaguer'
  res.render('index', {
    title: 'Formulario',
    name: name,
  });});

router.post('/', function(req, res, next) {
  const captcha = req.body['g-recaptcha-response'];
  const secretKey = process.env.secretkey;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  let name = req.body.name;
  let email = req.body.email;
  let comment = req.body.comment;
  let date = new Date();
  let fecha = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  let time = fecha;
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const IP = ip.split(",")[0];
  request(`http://ip-api.com/json/${IP}`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      let country = data.country;
      //Mostrar datos ingresados pos consola
      console.log({name, email, comment, time, IP, country});
      //Insertar daton en la base de datos
      db.insert(name, email, comment, time, IP, country);
       //Enviar email con los datos ingresados 
       const transporter = nodemailer.createTransport({
        host: process.env.hostemail,
        port: 465,
        secure: true,
        auth: {
            user: process.env.useremail,
            pass: process.env.passemail
          }
        });
        const mailOptions = {
          from: process.env.useremail,
          //Lista de correos 
          to: ['almagueralexander839@gmail.com', 'samueljpb@gmail.com', 'programacion2ais@dispostable.com'],
          subject: 'Task 3: Third Party Connection ',
          text: 'Un nuevo ususuario se ha registrado en el formulario:\n' + 'Nombre: ' + name + '\nCorreo: ' + email + '\nMensaje: ' + comment + '\nFecha y hora: ' + time + '\nIP: ' + IP + '\nUbicacion: ' + country
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
          } else {
              console.log('Correo electrónico enviado: ' + info.response);
          }});}});



          request(url, (err, response, body) => {
            if (body.success && body.score) {
              console.log('exitoso')
            } else {
              console.log('fracaso')
            }
          });
         
      
      res.redirect('/');
  });





router.get('/contactos', function(req, res, next) {
  db.select(function (rows) {
    console.log(rows);
  });
  res.send('ok');
});

module.exports = router;