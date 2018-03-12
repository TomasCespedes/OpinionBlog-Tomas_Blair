// REST API for the comments collection
const express = require('express');
const router = express.Router();

// Connect to the collection
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('opine');
  db.comments = db.collection('comments');
});

// Get all the comments for a specific opinion
router.get('/', function(request, response, next) {
  const comment = {opinion_id: new mongodb.ObjectId(request.query.opinion_id)};

  db.comments.find(comment).toArray(function(error, comments) {
    if (error) return next(error);
    response.json(comments);
  });
});

// Post a new comment (user must be logged in)
router.post('/', function(request, response, next) {
  if (!request.user) return next(new Error('Forbidden'));
  
  const comment = {
    author: request.user,
    opinion_id: new mongodb.ObjectId(request.body.opinion_id),
    argument: request.body.argument,
  };

  db.comments.insertOne(comment, function(error) {
    if (error) return next(error);
    response.json(comment);
  });
});

// Delete a comment (user must be logged in and match the comment author)
router.delete('/:id', function(request, response, next) {
  const comment = {
    _id: new mongodb.ObjectId(request.params.id),
    author: request.user,
  };

  db.comments.deleteOne(comment, function(error, report) {
    if (error) return next(error);
    if (!report.deletedCount) return next(new Error('Forbidden'));
    response.end();
  });
});

module.exports = router;
