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
  router.get('/:id/:name', function(request, response, next){ // REST convention: combine this with the get('/')
    const opinion = {
      "author": {
        "id": request.params.id,
        "name": decodeURI(request.params.name)
      }
    };
    db.opinions.find(opinion).toArray(function(error, opinions){
      if (error) return next(error);
      response.json(opinions);
    });
  });

  // Get a specific Opinion
    router.get('/solo', function(request, response, next) { // This looks like a duplicate of the one below
      const opinion =  {_id: new mongodb.ObjectId(request.query.opinion_id)};
      db.opinions.findOne(opinion, function(error, opinion){
        if (error) return next(error);
        if (!opinion) return next(new Error('Error!'));
        response.json(opinion);
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
  if (!request.user) return next(new Error('Forbidden')); // Access control: user must be logged in

  const opinion = {
    author: request.user, // Access control: user must be the opinion author
    _id: new mongodb.ObjectId(request.params.id)
  };
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
router.patch('/:id/like', function(request, response, next){ // REST convention: combine with the patch('/:id')
  if (!request.user) return next(new Error('Forbidden')); // Access control: user must be logged in

  const opinion = {
    author: {$ne: request.user}, // Access control: user can't be the opinion author
    _id: new mongodb.ObjectId(request.params.id)
  };
  const insertedLike = {
    $addToSet: {
      likes: request.user
    }
  }
  db.opinions.updateOne(opinion, insertedLike, function(error, report) {
    if (report.modifiedCount === 0) return next(new Error('Cannot like again')); // It was matching but not modifying
    response.end();
  });
});



module.exports = router;
