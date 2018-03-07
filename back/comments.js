// REST API routes for the comments collection
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('opine');
  db.comments = db.collection('comments');
});

const express = require('express');
const router = express.Router();

// Get all the comments for a specific opinion
router.get('/', function(request, response, next) {
  const comment = {opinion_id: new mongodb.ObjectId(request.query.opinion_id)};

  db.comments.find(comment).toArray(function(error, comments) {
    if (error) return next(error);
    response.json(comments);
  });
});

// Post a new comment
router.post('/', function(request, response, next) {
  const comment = {
    opinion_id: new mongodb.ObjectId(request.body.opinion_id),
    argument: request.body.argument,
  };

  db.comments.insertOne(comment, function(error) {
    if (error) return next(error);
    response.json(comment);
  });
});

// Delete a comment
router.delete('/:id', function(request, response, next) {
  const comment = {_id: new mongodb.ObjectId(request.params.id)};

  db.comments.deleteOne(comment, function(error) {
    if (error) return next(error);
    response.end();
  });
});

module.exports = router;
