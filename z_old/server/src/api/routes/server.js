const express = require('express');
const serverController = require('../controllers/server');

// const poke = require('../controllers/server/poke')

module.exports = (context) => {
  let router = express.Router();
  router.get('/', serverController.getInfo.bind(context));
  router.get('/poke', serverController.sendPoke.bind(context));
  router.get('/library', serverController.getLibrary.bind(context));
  router.get('/image', serverController.getStaticImage.bind(context));
  router.get('/video', serverController.getVideoStream.bind(context));
  return router;
};
