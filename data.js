// Set up the opinion database
const db = new Mongo().getDB('opine');
db.dropDatabase();

db.createCollection('opinions', {validator: {$and: [
  {claim: {$type: 'string', $ne: ''}},
  {argument: {$type: 'string', $ne: ''}},
]}});

const pie = db.opinions.insertOne({
  claim: "Pie is better than cake.",
  argument: "Posers can bake a passable cake from a box. Posers can't bake a passable pie. Pie is the no-posers-allowed zone of desserts. Pie keeps it real.",
});

const will = db.opinions.insertOne({
  claim: "Free will is an illusion.",
  argument: "The atoms in our bodies behave according to the laws of physics. If we had a sufficiently powerful supercomputer, it could simulate the future behavior of the atoms that make up our bodies, therefore predicting our every future move.",
});

db.createCollection('comments', {validator: {$and: [
  {opinion_id: {$type: 'objectId', $ne: ''}},
  {argument: {$type: 'string', $ne: ''}},
]}});

db.comments.insertMany([
  {
    opinion_id: pie.insertedId,
    argument: "Cake has frosting and therefore cake is better.",
  },
  {
    opinion_id: pie.insertedId,
    argument: "The cake is a lie.",
  },
]);

db.comments.insertMany([
  {
    opinion_id: will.insertedId,
    argument: "In order to predict how a hydrogen atom will behave, you'll have to predict how things smaller than atoms behave -- electrons, photons, quarks and other quanta. These particles behave in ways that are stochastic, or non-determined.",
  },
  {
    opinion_id: will.insertedId,
    argument: "Why would quantum randomness make free will exist though? Throwing dice is unpredictable but I wouldn't say dice have free will.",
  },
]);

// Make it fast to look up all comments on a given opinion
db.comments.createIndex({opinion_id: 1});
