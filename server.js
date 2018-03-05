// Web server for an opinion-sharing site
const express = require('express');
const server = express();

server.use(express.urlencoded({extended: true}));

server.get('/favicon.ico', function(request, response) {
  response.sendStatus(204);
});

// Logging
server.use(function(request, response, next) {
  console.log(request.method, request.url, request.body);
  next();
});

// Front end routes
server.use(express.static('front', {extensions: ['html']}));

// Back end APIs
server.use('/opinions', require('./back/opinions'));
server.use('/comments', require('./back/comments'));

// Error handling
server.use(function(error, request, response, next) {
  console.log(error.stack);

  switch(error.message) {
    case 'Bad request':
    case 'Document failed validation':
      response.sendStatus(400);
      break;
    case 'Not found':
    case 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters':
      response.sendStatus(404);
      break;
    default:
      response.sendStatus(500);
  }
});

server.listen(3000);
