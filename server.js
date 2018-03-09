// Web server for an opinion-sharing site
const express = require('express');
const server = express();

// Parse request bodies
server.use(express.urlencoded({extended: true}));

// Set up sessions to recognize authenticated users
const session = require('express-session');
server.use(session({
  name: 'opine', // Cookie name
  resave: false, // Required option
  saveUninitialized: false, // Required option
  secret: require('../secret'), // Accesses secret.js
}));

// Set up for authentication
const passport = require('passport');
server.use(passport.initialize());
server.use(passport.session());

// Via Google OAuth
const AuthenticationStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new AuthenticationStrategy(require('../credentials'), // Accesses credentials.js
  function(accessToken, refreshToken, profile, done) {
    user = {id: profile.id, name: profile.displayName};
    return done(null, user);
  }
));

// Send user object in the cookie
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Ignore icon requests
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

// Login route
server.get('/auth', passport.authenticate('google', {scope: ['profile']}));

// After login, send the user to the URL they were at before
server.get('/auth/callback', passport.authenticate('google'),
  (request, response) => response.redirect(request.headers.referer)
);

// Route for returning the logged-in user
server.get('/user', (request, response) => response.send(request.user));

// Logout route
server.get('/logout', function(request, response) {
  request.logout();
  response.redirect(request.headers.referer);
});

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
