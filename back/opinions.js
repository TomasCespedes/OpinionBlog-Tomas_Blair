// REST API for the opinions collection
const express = require('express');
const router = express.Router();

// Connect to the collection
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('opine');
  db.opinions = db.collection('opinions');
});

// Get all the opinions
router.get('/', function(request, response, next) {
  db.opinions.find().toArray(function(error, opinions) {
    if (error) return next(error);
    response.json(opinions);
  });
});

// Get a specific opinion
router.get('/:id', function(request, response, next) {
  const opinion = {_id: new mongodb.ObjectId(request.params.id)};

  db.opinions.findOne(opinion, function(error, opinion) {
    if (error) return next(error);
    if (!opinion) return next(new Error('Not found'));
    response.json(opinion);
  });
});

// Post a new opinion (user must be logged in)
router.post('/', function(request, response, next) {
  if (!request.user) return next(new Error('Forbidden'));

  const opinion = {
    author: request.user,
    claim: request.body.claim,
    argument: request.body.argument,
    likes: [],
  };

  db.opinions.insertOne(opinion, function(error) {
    if (error) return next(error);
    response.json(opinion);
  });
});

router.patch('/:id', function(request, response, next) {
  const opinion = {_id: new mongodb.ObjectId(request.params.id)};
  const newOpinion = {
    $set: {
      author: {id: 'Anonymous', name: 'Anonymous'}
    }
  }

  db.opinions.updateOne(opinion, newOpinion, function(error, report) {
    if (error) return next(error);
    if (!report.matchedCount) return next(new Error('Not found'));
    response.end();
  });
});

// like route
router.patch('/:id/like', function(request, response, next){
  const opinion = {_id: new mongodb.ObjectId(request.params.id)};
  const insertedLike = {
    $addToSet: {
      likes: request.user
    }
  }
  db.opinions.updateOne(opinion, insertedLike, function(error, report) {
    if (report.matchedCount === 0) return next(new Error('Cannot like again'));
    response.send(opinion);
  });
});



module.exports = router;
