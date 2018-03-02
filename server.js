// Web server for an opinion-sharing site
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('opine');
  db.opinions = db.collection('opinions');
  db.comments = db.collection('comments');
});

const express = require('express');
const server = express();

server.use(express.urlencoded({extended: true}));

server.get('/favicon.ico', function(request, response) {
  response.sendStatus(204);
});

server.use(function(request, response, next) {
  console.log(request.method, request.url, request.body);
  next();
});

///////////////////////////////////// Front end routes

server.get('/', function(request, response) {
  response.sendFile('index.html', {root: __dirname});
});

server.get('/discussion', function(request, response) {
  response.sendFile('discussion.html', {root: __dirname});
});

///////////////////////////////////// Back end routes

server.get('/opinions', function(request, response, next) {
  db.opinions.find().toArray(function(error, opinions) {
    if (error) return next(error);
    response.json(opinions);
  });
});

server.get('/opinions/:id', function(request, response, next) {
  const opinion = {_id: new mongodb.ObjectId(request.params.id)};

  db.opinions.findOne(opinion, function(error, opinion) {
    if (error) return next(error);
    if (!opinion) return next(new Error('Not found'));
    response.json(opinion);
  });
});

server.get('/comments', function(request, response, next) {
  const comment = {opinion_id: new mongodb.ObjectId(request.query.opinion_id)};

  db.comments.find(comment).toArray(function(error, comments) {
    if (error) return next(error);
    response.json(comments);
  });
});

/////////////////////////////////////

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
