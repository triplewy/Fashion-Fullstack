// use strict compiling
"use strict";
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var mysql = require('mysql')
var named = require('named-placeholders')();
var path = require('path');
var colors = require('colors');
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('redis')
var bcrypt = require('bcrypt');
var jo = require('jpeg-autorotate')
var fs = require('fs')
var validator = require('validator');
var nodemailer = require('nodemailer')
var randomstring = require('randomstring')
var sizeOf = require('image-size');
var cors = require('cors')
var socketIO = require('socket.io')
var passportSocketIo = require('passport.socketio');
var client = Redis.createClient();
var sessionStore = new RedisStore({
  host: 'localhost',
  port: 6379,
  client: client
})
var POLLING_INTERVAL = 10000

var app = express();

var server = http.createServer(app)

app.use(cors({credentials: true, origin: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
  store: sessionStore,
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 180*60*1000
  }
}));
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, done) {
  console.log("serializeUser userId is", user);
	done(null, user);
})

passport.deserializeUser(function(user, done) {
  console.log("deserializing user");
  done(null, user);
})

passport.use('local-login', new LocalStrategy(
 function(username, password, done) {
   conn.query('SELECT * FROM logins WHERE username=?', [username], function(err, result) {
      if (err) {
        return done(err)
      }
      if (result.length == 0) {
        return done(null, false)
      }
      bcrypt.compare(password, result[0].passwordHash, (err, isValid) => {
        if (err) {
          return done(err)
        }
        if (!isValid) {
          return done(null, false)
        }
        console.log("successfully logged in");
        return done(null, {userId: result[0].userId, username: result[0].username})
      })
    })
  }
))

passport.use('local-signup', new LocalStrategy({
  passReqToCallback : true
},
  function(req, username, password, done) {
    var email = ''
    if (validator.isEmail(req.body.email)) {
      email = req.body.email
    } else {
      console.log("email is invalid");
      return done(null, false, { message: 'Email is invalid' })
    }
    bcrypt.hash(password, 10, function(err, passwordHash) {
      bcrypt.hash(randomstring.generate(), 10, function(err, verificationHash) {
        conn.query('INSERT INTO users (username, profileName) VALUES (?,?)',
        [username.toLowerCase(), username], function(err, result) {
          if (err) {
            return done(err)
          } else {
            var userId = result.insertId
            conn.query('INSERT INTO logins (username, email, passwordText, passwordHash, verificationHash, userId) VALUES (?,?,?,?,?,?)',
              [username.toLowerCase(), email, password, passwordHash, verificationHash, userId], function(err, result) {
              if (err) {
                return done(err)
              } else {
                var link = "localhost:3000/verify?id=" + verificationHash;
                var mailOptions={
                  to : email,
                  subject : "Please confirm your Email account",
                  html : "Hello,<br> Please click on the link to verify your email.<br><a href="+ link +">" + link + "</a>"
                }
                smtpTransport.sendMail(mailOptions, function(err, response) {
                  if (err) {
                    return done(err)
                  } else {
                    console.log("Message sent");
                    return done(null, userId)
                  }
                })
              }
            })
          }
        })
      })
    })
  }
))

passport.use(new GoogleStrategy({
    clientID: '206855693376-62fvp593krr8jv2ih8lot21aapdhc5es.apps.googleusercontent.com',
    clientSecret: 'Bu7C0Zh8b3cnL68zvrM-EATX',
    callbackURL: "http://localhost:8081/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    conn.query('SELECT * FROM logins WHERE networkId=?', [profile.id], function(err, result) {
       if (err) {
         return done(err)
       }
       if (result.length > 0) {
         return done(null, {userId: result[0].userId, username: result[0].username})
       }
       var username = profile.displayName.replace(/\s+/g, '');
       Promise.all([generateUsername(username)])
       .then(function(allData) {
         conn.query('INSERT INTO users (username, profileName) VALUES (?,?)',
         [allData[0], profile.displayName], function(err, result) {
           if (err) {
             return done(err)
           }
           var userId = result.insertId
           conn.query('INSERT INTO logins (networkId, network, accessToken, email, verified, userId) VALUES (?,?,?,?,?,?)',
           [profile.id, profile.provider, accessToken, profile.emails[0].value, true, userId], function(err, result) {
             if (err) {
               return done(err)
             }
             return done(null, {userId: userId, username: allData[0]})
           })
         })
       })
     })
   }
))

const originalQuery = require('mysql/lib/Connection').prototype.query;

require('mysql/lib/Connection').prototype.query = function (...args) {
    if (Array.isArray(args[0]) || !args[1]) {
        return originalQuery.apply(this, args);
    }
    ([
        args[0],
        args[1]
    ] = named(args[0], args[1]));

    return originalQuery.apply(this, args);
};

var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'yushuf',
  password : 'soundcloud',
  database : 'fashion'
});

conn.query('SET foreign_key_checks = 0')
conn.query('DROP TABLE IF EXISTS users')
conn.query('DROP TABLE IF EXISTS posts')
conn.query('DROP TABLE IF EXISTS postsImages')
conn.query('DROP TABLE IF EXISTS playlists')
conn.query('DROP TABLE IF EXISTS tags');
conn.query('DROP TABLE IF EXISTS reposts');
conn.query('DROP TABLE IF EXISTS likes');
conn.query('DROP TABLE IF EXISTS views');
conn.query('DROP TABLE IF EXISTS comments');
conn.query('DROP TABLE IF EXISTS playlistsPosts');
conn.query('DROP TABLE IF EXISTS playlistsFollowers');
conn.query('DROP TABLE IF EXISTS playlistsReposts');
conn.query('DROP TABLE IF EXISTS playlistsLikes');
conn.query('DROP TABLE IF EXISTS playlistsComments');
conn.query('DROP TABLE IF EXISTS postsNotifications')
conn.query('DROP TABLE IF EXISTS playlistsNotifications')
conn.query('DROP TABLE IF EXISTS followingNotifications')
conn.query('DROP TABLE IF EXISTS following');
conn.query('DROP TABLE IF EXISTS logins')
conn.query('DROP TABLE IF EXISTS linksClicks')
conn.query('DROP TABLE IF EXISTS profilesVisits')
conn.query('SET foreign_key_checks = 1')

conn.query('CREATE TABLE IF NOT EXISTS users (userId INTEGER AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'location TEXT, followers INTEGER NOT NULL DEFAULT 0, following INTEGER NOT NULL DEFAULT 0, numPosts INTEGER NOT NULL DEFAULT 0, description TEXT, createdDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)')

conn.query('CREATE TABLE IF NOT EXISTS logins (loginId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, network TEXT, networkId TEXT, accessToken TEXT, username VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) UNIQUE, passwordText TEXT, passwordSalt TEXT, ' +
'passwordHash CHAR(60), verificationHash CHAR(60), verified BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY (userId) REFERENCES users(userId));')

conn.query('CREATE TABLE IF NOT EXISTS posts (mediaId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, username TEXT NOT NULL, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'title VARCHAR(255) NOT NULL, url VARCHAR(255) NOT NULL, genre TEXT, original BOOLEAN, ' +
'views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(userId, url));')

conn.query('CREATE TABLE IF NOT EXISTS postsImages (imageId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, imageUrl VARCHAR(255) NOT NULL UNIQUE, imageIndex INTEGER NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, displayWidth INTEGER, displayHeight INTEGER, FOREIGN KEY (mediaId) REFERENCES posts(mediaId));')

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, username TEXT NOT NULL, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'title VARCHAR(255), url VARCHAR(255) NOT NULL, genre TEXT, public BOOLEAN, coverImageId INTEGER NOT NULL, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, ' +
'followers INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY (coverImageId) REFERENCES postsImages(imageId), UNIQUE(title, userId))')

conn.query('CREATE TABLE IF NOT EXISTS followingNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS postsNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, mediaId INTEGER NOT NULL, activity INTEGER NOT NULL, comment TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS playlistsNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, playlistId INTEGER NOT NULL, activity INTEGER NOT NULL, comment TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId), FOREIGN KEY (playlistId) REFERENCES playlists(playlistId))')

conn.query('CREATE TABLE IF NOT EXISTS tags (tagId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, itemType TEXT NOT NULL, itemName TEXT, itemBrand TEXT, itemLink VARCHAR(255), original BOOLEAN NOT NULL DEFAULT FALSE, x INTEGER NOT NULL, y INTEGER NOT NULL, imageIndex INTEGER NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId))');

conn.query('CREATE TABLE IF NOT EXISTS reposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT, profile_image_src VARCHAR(255), dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS likes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS views (viewId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER, mediaId INTEGER NOT NULL, reposterId INTEGER, viewerId INTEGER NOT NULL, receiverId INTEGER NOT NULL, IP_Address TEXT, dateTime DATETIME NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), ' +
'FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (reposterId) REFERENCES users(userId), FOREIGN KEY (viewerId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId), UNIQUE(mediaId, viewerId, dateTime))');

conn.query('CREATE TABLE IF NOT EXISTS comments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistPostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, mediaId INTEGER NOT NULL, playlistIndex INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (mediaId) REFERENCES posts(mediaId), UNIQUE(playlistId, mediaId), UNIQUE(playlistId, playlistIndex))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistFollowId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsReposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT, profile_image_src VARCHAR(255), dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsLikes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsComments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS following (followingId INTEGER AUTO_INCREMENT PRIMARY KEY, followerUserId INTEGER NOT NULL, followingUserId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (followerUserId) REFERENCES users(userId), FOREIGN KEY (followingUserId) REFERENCES users(userId), UNIQUE(followerUserId, followingUserId))')

conn.query('CREATE TABLE IF NOT EXISTS linksClicks (clickId INTEGER AUTO_INCREMENT PRIMARY KEY, clickUserId INTEGER NOT NULL, linkUserId INTEGER NOT NULL, mediaId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (clickUserId) REFERENCES users(userId), FOREIGN KEY (linkUserId) REFERENCES users(userId), FOREIGN KEY (mediaId) REFERENCES posts(mediaId))')

conn.query('CREATE TABLE IF NOT EXISTS profilesVisits (clickId INTEGER AUTO_INCREMENT PRIMARY KEY, visitUserId INTEGER NOT NULL, profileUserId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (visitUserId) REFERENCES users(userId), FOREIGN KEY (profileUserId) REFERENCES users(userId))')

conn.query('CREATE TRIGGER before_following_insert BEFORE INSERT ON following FOR EACH ROW BEGIN ' +
'IF (NEW.followerUserId = NEW.followingUserId) THEN ' +
'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot follow yourself\', MYSQL_ERRNO = 1001; END IF; END;')

conn.query('CREATE TRIGGER after_following_insert AFTER INSERT ON following FOR EACH ROW BEGIN ' +
'UPDATE users SET followers = (SELECT COUNT(*) FROM following WHERE followingUserId=NEW.followingUserId) WHERE userId=NEW.followingUserId; ' +
'UPDATE users SET following = (SELECT COUNT(*) FROM following WHERE followerUserId=NEW.followerUserId) WHERE userId=NEW.followerUserId; ' +
'INSERT INTO followingNotifications (senderId, receiverId, dateTime) VALUES (NEW.followerUserId, NEW.followingUserId, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_following_delete AFTER DELETE ON following FOR EACH ROW BEGIN ' +
'UPDATE users SET followers = (SELECT COUNT(*) FROM following WHERE followingUserId=OLD.followingUserId) WHERE userId=OLD.followingUserId; ' +
'UPDATE users SET following = (SELECT COUNT(*) FROM following WHERE followerUserId=OLD.followerUserId) WHERE userId=OLD.followerUserId; ' + 'END;')

conn.query('CREATE TRIGGER after_likes_insert AFTER INSERT ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 0, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_likes_delete AFTER DELETE ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=0; END;')

conn.query('CREATE TRIGGER before_reposts_insert BEFORE INSERT ON reposts FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM ' +
'users WHERE userId = NEW.userId; SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; ' +
'IF (SELECT COUNT(*) FROM posts WHERE userId=NEW.userId AND mediaId=NEW.mediaId > 0) THEN ' +
'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot repost own track\', MYSQL_ERRNO = 1001; END IF; END;')

conn.query('CREATE TRIGGER after_reposts_insert AFTER INSERT ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 1, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_reposts_delete AFTER DELETE ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=1; END;')

conn.query('CREATE TRIGGER after_comments_insert AFTER INSERT ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, comment, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 2, NEW.comment, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_comments_delete AFTER DELETE ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=2; END;')

conn.query('CREATE TRIGGER after_playlistsLikes_insert AFTER INSERT ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 0, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsLikes_delete AFTER DELETE ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=0; END;')

conn.query('CREATE TRIGGER before_playlistsReposts_insert BEFORE INSERT ON playlistsReposts FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM ' +
'users WHERE userId = NEW.userId; SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; ' +
'IF (SELECT COUNT(*) FROM playlists WHERE userId=NEW.userId AND playlistId=NEW.playlistId > 0) THEN ' +
'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot repost own playlist\', MYSQL_ERRNO = 1001; END IF; END;')

conn.query('CREATE TRIGGER after_playlistsReposts_insert AFTER INSERT ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 1, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsReposts_delete AFTER DELETE ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=1; END;')

conn.query('CREATE TRIGGER after_playlistsFollowers_insert AFTER INSERT ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 3, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsFollowers_delete AFTER DELETE ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=3; END;')

conn.query('CREATE TRIGGER after_playlistsComments_insert AFTER INSERT ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, comment, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 2, NEW.comment, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsComments_delete AFTER DELETE ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=2; END;')

conn.query('CREATE TRIGGER after_postNotifications_update AFTER UPDATE ON postsNotifications FOR EACH ROW BEGIN ' +
'UPDATE playlistsNotifications SET unread=0 WHERE receiverId=NEW.receiverId; ' +
'UPDATE followingNotifications SET unread=0 WHERE receiverId=NEW.receiverId; END;')

conn.query('CREATE TRIGGER before_views_insert BEFORE INSERT ON views FOR EACH ROW BEGIN ' +
'DECLARE receiverId INTEGER; SET receiverId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); ' +
'IF (NEW.viewerId != receiverId) THEN SET NEW.receiverId = receiverId; END IF; END;')

conn.query('CREATE TRIGGER after_views_insert AFTER INSERT ON views FOR EACH ROW BEGIN ' +
'UPDATE posts SET views = (SELECT COUNT(*) FROM views WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; END;')

conn.query('CREATE TRIGGER before_linksClicks_insert BEFORE INSERT ON linksClicks FOR EACH ROW BEGIN ' +
'DECLARE linkUserId INTEGER; SET linkUserId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); ' +
'IF (NEW.clickUserId != linkUserId) THEN SET NEW.linkUserId = linkUserId; END IF; END;')

conn.query('CREATE TRIGGER before_posts_insert BEFORE INSERT ON posts FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM ' +
'users WHERE userId = NEW.userId; SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; END;')

conn.query('CREATE TRIGGER after_posts_insert AFTER INSERT ON posts FOR EACH ROW BEGIN ' +
'UPDATE users SET numPosts = (SELECT COUNT(*) FROM posts WHERE userId=NEW.mediaId) WHERE userId=NEW.userId; END;')

conn.query('CREATE TRIGGER after_posts_delete AFTER DELETE ON posts FOR EACH ROW BEGIN ' +
'UPDATE users SET numPosts = (SELECT COUNT(*) FROM posts WHERE userId=OLD.userId) WHERE userId=OLD.userId; END;')

conn.query('CREATE TRIGGER before_playlists_insert BEFORE INSERT ON playlists FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM ' +
'users WHERE userId = NEW.userId; SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; END;')


var connectedUserIds = []
var usersToSockets = {}
var socketsToUsers = {}

var io = socketIO(server)

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'secret',    // the session_secret to parse the cookie
  store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}

io.on('connection', socket => {
  console.log("User connected");
  var userId = socket.request.user.userId;
  usersToSockets[userId] = socket
  connectedUserIds.push(userId)
  socketsToUsers[socket] = userId
  if (connectedUserIds.length) {
    pollingLoop(connectedUserIds);
  }

  socket.on('receive notifications', function() {
    console.log("receive notifications received");

 })

  socket.on('disconnect', () => {
    var userId = socketsToUsers[socket]
    var userIndex = connectedUserIds.indexOf(userId);
    connectedUserIds.splice(userIndex, 1);
    delete socketsToUsers[socket]
    console.log('user disconnected')
  })
})

function pollingLoop(userIds) {
  if (userIds.length > 0) {
    var question_query = ''
    for (var i = 0; i < userIds.length; i++) {
      question_query += '?,'
    }
    question_query = question_query.slice(0, -1)


    conn.query('SELECT receiverId, COUNT(*) AS numUnreadNotifications FROM (' +
    'SELECT a.receiverId FROM postsNotifications AS a WHERE a.receiverId IN (' + question_query + ') AND a.unread=1 UNION ALL ' +
    'SELECT b.receiverId FROM playlistsNotifications AS b WHERE b.receiverId IN (' + question_query + ') AND b.unread=1 UNION ALL ' +
    'SELECT c.receiverId FROM followingNotifications AS c WHERE c.receiverId IN (' + question_query + ') AND c.unread=1) AS t GROUP BY receiverId', userIds.concat(userIds).concat(userIds), function(err, result) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < result.length; i++) {
          // console.log(result[i]);
          // if (result[i].numUnreadNotifications > 0) {
            // console.log("emitted");
            usersToSockets[result[i].receiverId].emit('unread notifications', result[i].numUnreadNotifications)
          // }
        }
        if (connectedUserIds.length) {
          setTimeout(function() {pollingLoop(connectedUserIds)}, POLLING_INTERVAL);
        } else {
          console.log('The server timer was stopped because there are no more socket connections on the app')
        }
      }
    })
  }
}

// var storage = multer.diskStorage({
//     destination: function(request, file, callback) {
//       callback(null, 'public/images')
//     },
//     filename: function(request, file, callback) {
//       callback(null, file.fieldname + '-' + Date.now() +'.jpg')
//     },
// });

var storage =  multer.memoryStorage()

var upload = multer({
  storage: storage,
  limits: {fileSize: 10000000, files: 5},
  fileFilter: function(request, file, callback) {
     var ext = path.extname(file.originalname)
     console.log("ext is", ext);
     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.JPG') {
          return callback(new Error('Only images are allowed'), false);
      }
      callback(null, true)
  }
}).array('image', 5);

var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: 'yushufstartup',
        pass: 'fashionsoundcloud'
    }
})
// serve static files
// app.use(express.static('dist'));

var insertQuery = ["jbin", "Jennifer Bin", "/images/jbin.jpg", "Shanghai, China", "yuh"];
var insertSQL = 'INSERT INTO users (username, profileName, profile_image_src, location, description) ' +
  'VALUES (?, ?, ?, ?, ?)';
conn.query(insertSQL, insertQuery, function(err, result) {
  if (err) {
    /*TODO: Handle Error*/
    console.log(err);
  } else {
    console.log("Records successfully added");
  }
})

bcrypt.hash('password', 10, function(err, hash) {
  conn.query('INSERT INTO logins (username, email, passwordText, passwordHash, userId) VALUES (?,?,?,?,?)',
    ['jbin', 'jbin', 'password', hash, 1], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })
})

insertQuery = [1, "Shanghai", "shanghai", "techwear", 1, "Jbin in Shanghai"];
insertSQL = 'INSERT INTO posts (userId, title, url, genre, original, description) ' +
  'VALUES (?, ?, ?, ?, ?, ?)';

conn.query(insertSQL, insertQuery, function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("Records successfully added");
  }
})

conn.query('INSERT INTO postsImages (mediaId, imageUrl, width, height, imageIndex) VALUES (?, ?, ?, ?, ?)',
[1, "/images/image-1527760266767.jpg", 1080, 1350, 0], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

conn.query('INSERT INTO postsImages (mediaId, imageUrl, width, height, imageIndex) VALUES (?, ?, ?, ?, ?)',
[1, "/images/jbin.jpg", 1124, 1999, 1], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });


conn.query('INSERT INTO comments (mediaId, userId, comment) VALUES (?, ?, ?)', [1, 1, "this is dope"], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

conn.query('INSERT INTO comments (mediaId, userId, comment) VALUES (?, ?, ?)', [1, 1, "e"], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
  });


  insertQuery = ["tkd", "The Killa Detail", "Perth, Australia", "filler description", '/profileImages/tkd-pfp.jpg'];
  insertSQL = 'INSERT INTO users (username, profileName, location, description, profile_image_src) ' +
    'VALUES (?, ?, ?, ?, ?)';
  conn.query(insertSQL, insertQuery, function(err, result) {
      if (err) {
        /*TODO: Handle Error*/
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    })


  bcrypt.hash('password', 10, function(err, hash) {
    conn.query('INSERT INTO logins (username, email, passwordText, passwordHash, userId) VALUES (?,?,?,?,?)',
      ['tkd', 'tkd', 'password', hash, 2], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    })
  })

  insertQuery = [2, "Laundromat", "laundromat", "streetwear", 0, "filler"];
  insertSQL = 'INSERT INTO posts (userId, title, url, genre, original, description)' +
    'VALUES (?, ?, ?, ?, ?, ?)';

  conn.query(insertSQL, insertQuery, function(err, result) {
      if (err) {
        /*TODO: Handle Error*/
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    })

  conn.query('INSERT INTO postsImages (mediaId, imageUrl, width, height, imageIndex) VALUES (?, ?, ?, ?, ?)', [2, "/images/image-1529571492908.jpg", 1000, 750, 0], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    });

    conn.query('INSERT INTO playlists (userId, title, url, public, coverImageId, description) VALUES ' +
    '(?,?,?,?,?,?)', [1, "Test Playlist", "test-playlist", 1, 1, "Test playlist description"], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Records successfully added");
        }
    });

  conn.query('INSERT INTO playlistsComments (playlistId, userId, comment) VALUES (?, ?, ?)', [1, 1, "h"], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Records successfully added");
        }
    });


  conn.query('INSERT INTO playlistsPosts (playlistId, mediaId, playlistIndex) VALUES (1,1,0),(1,2,1)', function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })

  conn.query('INSERT INTO reposts (mediaId, userId) VALUES (?,?)', [2,1], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })

  conn.query('INSERT INTO following (followerUserId, followingUserId) VALUES (?,?)', [2,1], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/google/callback', passport.authenticate('google'), function(req, res) {
  res.cookie('userId', req.user.userId)
  res.redirect('http://localhost:3000/');
});

app.get('/api/sessionLogin', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/sessionLogin');
  // res.send({message: "success"})
  const userId = req.user.userId
  conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=? LIMIT 1', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0]);
    }
  })
})

app.get('/api/verify', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/verify');
  var hash = req.query.id
  conn.query('UPDATE logins SET verified = 1 WHERE verificationHash=?', [hash], function(err, result) {
    if (err) {
      console.log(err);
      res.send({message: 'error'})
    } else {
      if (result.length > 0) {
        res.send({message: 'verified'})
      } else {
        res.send({message: 'failed to verify'})
      }
    }
  })
})

app.get('/api/navbar', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/navbar');
  var userId = req.user.userId;
  conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=?', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({username: result[0].username, profileName: result[0].profileName,
        profile_image_src: result[0].profile_image_src});
    }
  })
})

app.get('/api/dropdownProfile/:username', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/dropdownProfile/' + req.params.username);
  var userId = req.user.userId
  var username = req.params.username
  conn.query('SELECT userId, followers, location, ' +
  '(SELECT COUNT(*) FROM following WHERE followerUserId = :userId AND followingUserId = users.userId) > 0 AS isFollowing, ' +
  '(SELECT COUNT(*) FROM following WHERE followerUserId = users.userId AND followingUserId = :userId) > 0 AS followsYou, ' +
  '(userId = :userId) AS isProfile FROM users WHERE username = :username', {userId: userId, username: username}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result[0]
      if (row) {
        res.send({profileName: row.profileName, location: row.location, followers: row.followers,
          isFollowing: row.isFollowing, followsYou: row.followsYou, isProfile: row.isProfile})
      } else {
        res.send({error: 'no user'})
      }
    }
  })
})

app.get('/api/followers/:orderBy', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/followers/' + req.params.orderBy);
  var userId = req.user.userId
  var orderBy = orderFollowers(req.params.orderBy)
  conn.query('SELECT a.username, a.profileName, a.profile_image_src FROM following INNER JOIN users AS a ON a.userId = following.followerUserId ' +
  'WHERE followingUserId = ? ' + orderBy, [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({followers: result})
    }
  })
})

app.get('/api/following/:orderBy', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/following/' + req.params.orderBy);
  var userId = req.user.userId
  var orderBy = orderFollowers(req.params.orderBy)
  conn.query('SELECT a.username, a.profileName, a.profile_image_src FROM following INNER JOIN users AS a ON a.userId = following.followingUserId ' +
  'WHERE followerUserId = ? ' + orderBy, [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({following: result})
    }
  })
})

app.get('/api/notificationsDropdown/:unread', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/notificationsDropdown/' + req.params.unread);
  var userId = req.user.userId
  var numUnreads = parseInt(req.params.unread, 10)
  if (isNaN(numUnreads) || numUnreads <= 3) {
    numUnreads = 3;
  }
  conn.query('UPDATE postsNotifications SET unread=0 WHERE receiverId=?', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      conn.query('SELECT a.mediaId, null AS playlistId, c.title, c.url, a.activity, a.comment, b.username, ' +
      'JSON_OBJECT(\'imageUrl\', d.imageUrl, \'width\', d.width, \'height\', d.height) AS image, ' +
      'b.profileName, b.profile_image_src, null AS isFollowing, a.dateTime FROM postsNotifications AS a ' +
      'INNER JOIN users AS b ON b.userId = a.senderId INNER JOIN posts AS c ON c.mediaId = a.mediaId ' +
      'INNER JOIN postsImages AS d ON d.mediaId = a.mediaId AND d.imageIndex = 0 WHERE receiverId=:userId ' +
      'UNION ALL ' +
      'SELECT null AS mediaId, a.playlistId AS playlistId, c.title, c.url, a.activity, a.comment, b.username, ' +
      'JSON_OBJECT(\'imageUrl\', d.imageUrl, \'width\', d.width, \'height\', d.height) AS image, ' +
      'b.profileName, b.profile_image_src, null AS isFollowing, a.dateTime FROM playlistsNotifications AS a ' +
      'INNER JOIN users AS b ON b.userId = a.senderId INNER JOIN playlists AS c ON c.playlistId = a.playlistId ' +
      'JOIN postsImages AS d ON d.imageId = c.coverImageId WHERE receiverId=:userId ' +
      'UNION ALL ' +
      'SELECT null AS mediaId, null AS playlistId, null AS title, null AS url, null AS activity, null AS comment, b.username, null AS image, b.profileName, ' +
      'b.profile_image_src, (SELECT COUNT(*) FROM following WHERE followerUserId=:userId AND followingUserId = b.userId) > 0 AS isFollowing,  a.dateTime FROM followingNotifications AS a ' +
      'INNER JOIN users AS b ON b.userId = a.senderId WHERE receiverId=:userId ' +
      'ORDER BY dateTime DESC LIMIT :numUnreads', {userId: userId, numUnreads: numUnreads}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          var notifications = []
          for (var i = 0; i < result.length; i++) {
            var row = result[i]
            if (row.image) {
              row.image = JSON.parse(row.image)
            }
            if (row.mediaId) {
              notifications.push({post: row})
            } else if (row.playlistId){
              notifications.push({playlist: row})
            } else {
              notifications.push({follow: row})
            }
          }
          res.send({notifications: notifications});
        }
      })
    }
  })
})

app.get('/api/postTags/:mediaId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postTags/' + req.params.mediaId);
  const userId = req.user.userId
  const mediaId = req.params.mediaId

  conn.query('SELECT itemType, itemName, itemBrand, itemLink, original, x, y, imageIndex ' +
  'FROM tags WHERE mediaId=:mediaId', {mediaId: mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/postStats/:mediaId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postStats/' + req.params.mediaId);
  const userId = req.user.userId
  const mediaId = req.params.mediaId

  conn.query('SELECT views, likes, reposts, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = :mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = :mediaId) > 0) AS liked ' +
  'FROM posts WHERE mediaId=:mediaId LIMIT 1', {userId: userId, mediaId: mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/profileStats', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/profileStats');
  var userId = req.user.userId
  var now = new Date()
  var yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
  var weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
  conn.query('SELECT SUM(CASE WHEN dateTime BETWEEN :yesterday AND :now THEN 1 ELSE 0 END) AS dayViews, ' +
  'SUM(CASE WHEN dateTime BETWEEN :weekAgo AND :now THEN 1 ELSE 0 END) AS weekViews, COUNT(*) AS totalViews FROM views WHERE receiverId = :userId',
  {yesterday: yesterday.toISOString(), now: now.toISOString(), weekAgo: weekAgo.toISOString(), userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({dayViews: result[0].dayViews, weekViews: result[0].weekViews, totalViews: result[0].totalViews})
    }
  })
})

app.get('/api/postsStats/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postsStats/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery1 = ''
  var timePeriodQuery2 = ''
  if (timePeriod) {
    timePeriodQuery1 = 'b.dateTime BETWEEN :timePeriod AND :now AND '
    timePeriodQuery2 = 'a.dateTime BETWEEN :timePeriod AND :now AND '
  }

  conn.query('SELECT SUM(CASE WHEN a.activity = 0 THEN 1 ELSE 0 END) AS likes, SUM(CASE WHEN a.activity = 1 THEN 1 ELSE 0 END) AS reposts, ' +
  'SUM(CASE WHEN a.activity = 2 THEN 1 ELSE 0 END) AS comments, views.postsViews AS postsViews, views.repostsViews AS repostsViews, views.playlistsViews AS playlistsViews FROM postsNotifications AS a INNER JOIN (SELECT ' +
  'COUNT(*) AS postsViews, COUNT(b.reposterId) AS repostsViews, COUNT(b.playlistId) AS playlistsViews FROM views AS b WHERE ' + timePeriodQuery1 + 'b.receiverId = :userId) AS views ' +
  'WHERE ' + timePeriodQuery2 + 'a.receiverId = :userId GROUP BY views.postsViews, views.repostsViews, views.playlistsViews',
  {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({postsViews: result[0].postsViews, repostsViews: result[0].repostsViews, playlistsViews: result[0].playlistsViews,
        likes: result[0].likes, reposts: result[0].reposts, comments: result[0].comments})
    }
  })
})

app.get('/api/topPosts/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPosts/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND views.dateTime BETWEEN :timePeriod AND :now '
  }

  conn.query('SELECT views.mediaId, posts.title, posts.imageUrl, COUNT(*) AS views FROM views ' +
  'INNER JOIN posts ON posts.mediaId = views.mediaId WHERE receiverId = :userId ' + timePeriodQuery +
  'GROUP BY views.mediaId ORDER BY views LIMIT 3', {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({topPosts: result})
    }
  })
})

app.get('/api/topPostsViewers/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPostsViewers/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND views.dateTime BETWEEN :timePeriod AND :now '
  }

  conn.query('SELECT views.viewerId, users.username, users.profileName, users.profile_image_src, COUNT(*) AS views FROM views ' +
  'INNER JOIN users ON users.userId = views.viewerId WHERE receiverId = :userId ' + timePeriodQuery +
  'GROUP BY views.viewerId ORDER BY views LIMIT 3', {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({topViewers: result})
    }
  })
})

app.get('/api/playlistsStats/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistsStats/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery1 = ''
  var timePeriodQuery2 = ''
  if (timePeriod) {
    timePeriodQuery1 = 'b.dateTime BETWEEN :timePeriod AND :now AND '
    timePeriodQuery2 = 'a.dateTime BETWEEN :timePeriod AND :now AND '
  }
  conn.query('SELECT SUM(CASE WHEN a.activity = 0 THEN 1 ELSE 0 END) AS likes, SUM(CASE WHEN a.activity = 1 THEN 1 ELSE 0 END) AS reposts, ' +
  'SUM(CASE WHEN a.activity = 2 THEN 1 ELSE 0 END) AS comments, SUM(CASE WHEN a.activity = 3 THEN 1 ELSE 0 END) AS followers, ' +
  'views.playlistsViews AS playlistsViews, views.repostsViews AS repostsViews FROM playlistsNotifications AS a INNER JOIN (SELECT ' +
  'SUM(CASE WHEN b.playlistId IN (SELECT playlistId FROM playlists WHERE userId = :userId) THEN 1 ELSE 0 END) AS playlistsViews,  ' +
  'SUM(CASE WHEN b.playlistId IN (SELECT playlistId FROM playlists WHERE userId = :userId) AND b.reposterId IS NOT NULL THEN 1 ELSE 0 END) AS repostsViews FROM views AS b ' +
  'WHERE ' + timePeriodQuery1 + 'b.receiverId = :userId) AS views ' +
  'WHERE ' + timePeriodQuery2 + 'a.receiverId = :userId GROUP BY views.playlistsViews, views.repostsViews',
  {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({views: result[0].views, likes: result[0].likes, reposts: result[0].reposts, comments: result[0].comments, followers: result[0].followers,
      playlistsViews: result[0].playlistsViews, repostsViews: result[0].repostsViews})
    }
  })
})

app.get('/api/topPlaylists/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPlaylists/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND views.dateTime BETWEEN :timePeriod AND :now '
  }
  conn.query('SELECT views.playlistId, playlists.title, playlists.coverImageUrl, COUNT(*) AS views FROM views ' +
  'INNER JOIN playlists ON playlists.playlistId = views.playlistId WHERE receiverId = :userId ' + timePeriodQuery + 'AND views.playlistId IS NOT NULL ' +
  'GROUP BY views.playlistId ORDER BY views LIMIT 3', {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({topPlaylists: result})
    }
  })
})

app.get('/api/topPlaylistsViewers/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPlaylistsViewers/' + req.params.timePeriod);
  var userId = req.user.userId
  var now = new Date()
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND views.dateTime BETWEEN :timePeriod AND :now '
  }

  conn.query('SELECT views.viewerId, users.username, users.profileName, users.profile_image_src, COUNT(*) AS views FROM views ' +
  'INNER JOIN users ON users.userId = views.viewerId WHERE receiverId = :userId ' + timePeriodQuery + 'AND views.playlistId IS NOT NULL ' +
  'GROUP BY views.viewerId ORDER BY views LIMIT 3', {userId: userId, timePeriod: timePeriod.toISOString(), now: now.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send({topViewers: result})
    }
  })
})

app.get('/api/home', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/home');
  Promise.all([getStream(req.user.userId, req.user.userId, false, false, false, false, false)])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/homeOriginal', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/homeOriginal');
  Promise.all([getStream(req.user.userId, req.user.userId, false, true, false, false, false)])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/explore/hot', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/hot');
  const userId = req.user.userId
  exploreHelper(0, userId).then(function(result) {
    res.send(result)
  }).catch(e => {
    console.log(e);
  })
})

app.get('/api/explore/new', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/new');
  const userId = req.user.userId
  exploreHelper(1, userId).then(function(result) {
    res.send(result)
  }).catch(e => {
    console.log(e);
  })
})

app.get('/api/explore/top/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/top/'  + req.params.timePeriod);
  const userId = req.user.userId
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod)
  if (timePeriod) {
    exploreHelper(2, userId, {now: now, timePeriod: timePeriod}).then(function(result) {
      res.send(result)
    }).catch(e => {
      console.log(e);
    })
  } else {
    exploreHelper(2, userId).then(function(result) {
      res.send(result)
    }).catch(e => {
      console.log(e);
    })
  }
})

app.get('/api/explore/random/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/random/' + req.params.timePeriod);
  const userId = req.user.userId
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod)
  if (timePeriod) {
    exploreHelper(3, userId, {now: now, timePeriod: timePeriod}).then(function(result) {
      res.send(result)
    }).catch(e => {
      console.log(e);
    })
  } else {
    exploreHelper(3, userId).then(function(result) {
      res.send(result)
    }).catch(e => {
      console.log(e);
    })
  }
})

app.get('/api/explore/hot/:genre', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/hot/' + req.params.genre);
  const userId = req.user.userId
  conn.query('SELECT *, a.images, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' +
  '(LOG(10, GREATEST(1, posts.views/10 + posts.likes)) + UNIX_TIMESTAMP(posts.dateTime)/45000) AS hotScore, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS liked FROM posts ' +
  'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS images FROM postsImages GROUP BY mediaId) a ON a.mediaId = posts.mediaId ' +
  'INNER JOIN users AS b ON b.userId = posts.userId ORDER BY hotScore DESC LIMIT 24', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/explore/new/:genre', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/new/' + req.params.genre);
  const userId = req.user.userId
  conn.query('SELECT *, a.images, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS liked FROM posts ' +
  'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS images FROM postsImages GROUP BY mediaId) a ON a.mediaId = posts.mediaId ' +
  'INNER JOIN users AS b ON b.userId = posts.userId ORDER BY posts.dateTime DESC LIMIT 24', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/explore/top/:genre/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/top/' + req.params.genre + '/' + req.params.timePeriod);
  const userId = req.user.userId
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'WHERE posts.dateTime BETWEEN :timePeriod AND :now '
  }
  conn.query('SELECT *, a.images, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS liked FROM posts ' +
  'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS images FROM postsImages GROUP BY mediaId) a ON a.mediaId = posts.mediaId ' +
  'INNER JOIN users AS b ON b.userId = posts.userId ' + timePeriodQuery + 'ORDER BY posts.views DESC LIMIT 24', {userId: userId, now: now, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/explore/random/:genre/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/random/' + req.params.genre + '/' + req.params.timePeriod);
  const userId = req.user.userId
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod)
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'WHERE posts.dateTime BETWEEN :timePeriod AND :now '
  }
  conn.query('SELECT *, a.images, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS liked FROM posts ' +
  'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS images FROM postsImages GROUP BY mediaId) a ON a.mediaId = posts.mediaId ' +
  'INNER JOIN users AS b ON b.userId = posts.userId ' + timePeriodQuery + 'ORDER BY posts.views DESC LIMIT 24', {userId: userId, now: now, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/urlAvailable/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/urlAvailable/' + req.params.url);
  const userId = req.user.userId
  conn.query('SELECT 1 FROM posts WHERE userId=? AND url=?', [userId, req.params.url], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result)
    }
  })
})

app.get('/api/topBrands', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topBrands');
  conn.query('SELECT itemBrand FROM tags GROUP BY itemBrand ORDER BY COUNT(*) DESC LIMIT 50', [], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/topGenres', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topGenres');
  conn.query('SELECT genre FROM posts GROUP BY genre ORDER BY COUNT(*) DESC LIMIT 50', [], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/genre/:genre/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/genre/' + req.params.genre + '/' + req.params.timePeriod);
  var genre = req.params.genre
  var timePeriod = getTimePeriod(req.params.timePeriod)
  var userId = null
  if (req.user) {
    userId = req.user.userId
  }
  conn.query('SELECT *, a.username, a.profileName, a.profile_image_src FROM posts INNER JOIN users AS a ON a.userId = posts.userId ' +
  'WHERE genre = ? ORDER BY dateTime LIMIT 20', [genre], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/post/:username/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/post/' + req.params.username + '/' + req.params.url);
  const userId = req.user.userId
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT a.*, a.dateTime AS uploadDate, b.imageUrls, c.postTags, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS liked, ' +
  '(:userId = a.userId) AS isPoster FROM posts AS a ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) b ON b.mediaId = a.mediaId ' +
  'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'itemX\', x, \'itemY\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) c ON c.mediaId = a.mediaId ' +
  'WHERE username = :username AND url = :url LIMIT 1', {userId: userId, username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      result[0].imageUrls = JSON.parse(result[0].imageUrls)
      if (result[0].postTags) {
        result[0].postTags = JSON.parse(result[0].postTags)
      }
      res.send(result[0])
    }
  })
})

app.get('/api/:username/album/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/album/' + req.params.username + '/' + req.params.url);
  const userId = req.user.userId
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT a.*, a.dateTime AS uploadDate, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', c.mediaId, \'username\', c.username, \'profileName\', c.profileName, \'profile_image_src\', c.profile_image_src, ' +
  '\'title\', c.title, \'url\', c.url, \'views\', c.views, \'imageUrls\', d.imageUrls)) AS posts, ' +
  '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS followed, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS liked, ' +
  '(:userId = a.userId) AS isPoster FROM playlists AS a ' +
  'JOIN playlistsPosts AS b ON b.playlistId = a.playlistId ' +
  'JOIN posts AS c ON c.mediaId = b.mediaId ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) d ON d.mediaId = c.mediaId ' +
  'WHERE a.username = :username AND a.url = :url GROUP BY a.playlistId LIMIT 1', {userId: userId, username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      result[0].posts = JSON.parse(result[0].posts)
      res.send(result[0])
    }
  })
})

app.get('/api/getPlaylists', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/getPlaylists');
  var userId = req.user.userId;
  conn.query('SELECT *, (SELECT COUNT(*) FROM playlistsPosts WHERE playlistId = playlists.playlistId) AS numPosts FROM playlists ' +
  'WHERE userId=? ORDER BY dateTime',
  [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var playlists = []
      for (var i = 0; i < result.length; i++) {
        var row = result[i]
        playlists.push({playlistId: row.playlistId, title: row.title, public: row.public,
        numPosts: row.numPosts, genre: row.genre, followers: row.followers, dateTime: row.dateTime})
      }
      res.send({playlists: playlists})
    }
  })
})

app.get('/api/playlistPost/:mediaId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistPost/' + req.params.mediaId);
  var userId = req.user.userId;
  var mediaId = req.params.mediaId
  conn.query('SELECT (SELECT COUNT(*) FROM views WHERE mediaId = a.mediaId) AS views, a.likes, a.reposts, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', b.imageUrl, \'width\', b.width, \'height\', b.height, \'imageIndex\', b.imageIndex)) AS imageUrls, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS liked, ' +
  '(a.userId = :userId) AS isPoster ' +
  'FROM posts AS a INNER JOIN postsImages AS b ON b.mediaId = a.mediaId WHERE a.mediaId = :mediaId LIMIT 1', {userId: userId, mediaId: mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result[0]
      res.send({views: row.views, likes: row.likes, reposts: row.reposts, liked: row.liked, reposted: row.reposted,
        isPoster: row.isPoster, imageUrls: JSON.parse(row.imageUrls)})
    }
  })
})

app.post('/api/profileVisit', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/profileVisit');
  const userId = req.user.userId
  const username = req.body.username
  conn.query('INSERT IGNORE INTO profilesVisits (visitUserId, profileUserId) VALUES (?, (SELECT userId FROM users WHERE username = ? LIMIT 1))',
  [userId, username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.insertId) {
        console.log("Recorded profile visit successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/linkClick', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/linkClick');
  const userId = req.user.userId
  const mediaId = req.body.mediaId
  conn.query('INSERT IGNORE INTO linksClicks (clickUserId, mediaId) VALUES (?,?)', [userId, mediaId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Recorded click successfully");
      res.send({message: "success"})
    }
  })
})

app.post('/api/postVisit', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postVisit');
  const userId = req.user.userId
  const view = req.body.view

  conn.query('INSERT IGNORE INTO views (mediaId, viewerId, dateTime) VALUES ' +
  '(:mediaId, :userId, :dateTime)', {mediaId: view.mediaId, userId: userId, dateTime: view.dateTime}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.insertId) {
        console.log("Recorded views successfully");
        res.send({message: "success"})
      } else {
        res.send({message: "same user"})
      }
    }
  })
})

app.post('/api/storeViews', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/storeViews');
  var userId = req.user.userId
  var reqViews = req.body.views
  var question_query = ''
  var views = []

  for (var i = 0; i < reqViews.length; i++) {
    var currView = reqViews[i]
    views.push(currView.playlistId, currView.mediaId, currView.reposter, userId, currView.dateTime)
    question_query += '(?,?,(SELECT userId FROM users WHERE username = ? LIMIT 1),?,?),'
  }
  question_query = question_query.slice(0, -1)

  conn.query('INSERT IGNORE INTO views (playlistId, mediaId, reposterId, viewerId, dateTime) VALUES ' + question_query, views, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.insertId) {
        console.log("Recorded views successfully");
        res.send({message: "success"})
      } else {
        res.send({message: "same user"})
      }
    }
  })
})

app.post('/api/newPlaylist', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/newPlaylist');
  var userId = req.user.userId
  var mediaId = req.body.mediaId
  var title = req.body.title
  var isPublic = req.body.isPublic
  var genre = req.body.genre
  var description = req.body.description

  conn.query('INSERT IGNORE INTO playlists (userId, title, genre, public, coverImageUrl, description) VALUES (?, ?, ?, ?, (SELECT imageUrl FROM posts WHERE mediaId = ?), ?)', [userId, title, genre, isPublic, mediaId, description], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result.insertId);
      if (!result.insertId) {
        res.send({message: "Playlist title already exists"})
      }
      conn.query('INSERT IGNORE INTO playlistsPosts (playlistId, mediaId) VALUES (?,?)', [result.insertId, mediaId], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Created playlist successfully");
          res.send({message: "success"})
        }
      })
    }
  })
})

app.post('/api/like', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/like');
  Promise.all([addToCollection(req, 'likes', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/unlike', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/unlike');
  Promise.all([removeFromCollection(req, 'likes', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/repost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/repost');
  Promise.all([addToCollection(req, 'reposts', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/unrepost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/unrepost');
  Promise.all([removeFromCollection(req, 'reposts', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistLike', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistLike');
  Promise.all([addToCollection(req, 'playlistsLikes', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistUnlike', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistUnlike');
  Promise.all([removeFromCollection(req, 'playlistsLikes', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistRepost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistRepost');
  Promise.all([addToCollection(req, 'playlistsReposts', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistUnrepost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistUnrepost');
  Promise.all([removeFromCollection(req, 'playlistsReposts', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistFollow', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistFollow');
  var userId = req.user.userId
  var playlistId = req.body.playlistId
  conn.query('INSERT IGNORE INTO playlistsFollowers (playlistId, userId) VALUES (?,?)',
  [playlistId, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.insertId) {
        res.send({message: "Already Followed"})
      } else {
        console.log("Playlist Followed Successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/playlistUnfollow', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistUnfollow');
  var userId = req.user.userId
  var playlistId = req.body.playlistId
  conn.query('DELETE FROM playlistsFollowers WHERE playlistId=? AND userId=?',
  [playlistId, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.affectedRows) {
        res.send({message: "Didn't Follow"})
      } else {
        console.log("Playlist unollowed Successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/comment', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/comment');
  var userId = req.user.userId;
  var mediaId = req.body.mediaId;
  var comment = req.body.comment;
  conn.query('INSERT INTO comments (mediaId, userId, comment) VALUES (?, ?, ?)',
  [mediaId, userId, comment], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.insertId) {
        res.send({message: 'failed'})
      } else {
        console.log("commented successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/playlistComment', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistComment');
  var userId = req.user.userId;
  var playlistId = req.body.playlistId;
  var comment = req.body.comment;
  conn.query('INSERT INTO playlistsComments (playlistId, userId, comment) VALUES (?, ?, ?)',
  [playlistId, userId, comment], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.insertId) {
        res.send({message: 'failed'})
      } else {
        console.log("commented successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/addToPlaylist', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/addToPlaylist');
  var userId = req.user.userId
  var playlistId = req.body.playlistId
  var mediaId = req.body.mediaId
  console.log("mediaId is", mediaId);
  conn.query('INSERT IGNORE INTO playlistsPosts (playlistId, mediaId) VALUES (?, ?)',
  [playlistId, mediaId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("result lastInsert Id is", result.insertId);
      if (result.insertId == 0) {
        res.send({message: "Already in playlist"})
      } else {
        res.send({message: "success"})
      }
    }
  })
})

app.get('/api/you/likes/posts', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/likes/posts');
  var userId = req.user.userId;
  conn.query('SELECT b.*, b.dateTime AS uploadDate, c.imageUrls, a.dateTime AS likeTime, true AS liked, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS reposted ' +
  'FROM likes AS a ' +
  'JOIN posts AS b ON b.mediaId = a.mediaId ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) c ON c.mediaId = b.mediaId ' +
  'WHERE a.userId=:userId ORDER BY likeTime DESC LIMIT 24', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        result[i].imageUrls = JSON.parse(result[i].imageUrls)
      }
      res.send(result)
    }
  })
})

app.get('/api/you/likes/albums', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/likes/albums');
  var userId = req.user.userId;
  conn.query('SELECT b.*, c.coverImage, b.dateTime AS uploadDate, a.dateTime AS likeTime, true AS liked, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId = :userId AND playlistId = a.playlistId) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId = :userId AND playlistId = a.playlistId) > 0) AS followed ' +
  'FROM playlistsLikes AS a ' +
  'JOIN playlists AS b ON b.playlistId = a.playlistId ' +
  'JOIN (SELECT imageId, JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height) AS coverImage FROM postsImages GROUP BY imageId) c ON c.imageId = b.coverImageId ' +
  'WHERE a.userId=:userId ORDER BY likeTime DESC LIMIT 24', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        result[i].coverImage = JSON.parse(result[i].coverImage)
      }
      res.send(result)
    }
  })
})

app.get('/api/:profile/info', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/info');
  const userId = req.user.userId
  const username = req.params.profile
  conn.query('SELECT a.*, ' +
  '((SELECT COUNT(*) FROM following WHERE followingUserId = a.userId AND followerUserId = :userId) > 0) AS isFollowing, ' +
  '((SELECT COUNT(*) FROM following WHERE followingUserId = :userId AND followerUserId = a.userId) > 0) AS followsYou ' +
  'FROM users AS a WHERE a.username = :username LIMIT 1', {userId: userId, username: username}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      const row = result[0]
      const isUser = (row.userId == userId)
      res.send({profile: row, isUser: isUser})
    }
  })
})

app.get('/api/:profile/stream', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/stream');
  const username = req.params.profile;
  const userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username = ? LIMIT 1', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      getStream(userId, result[0].userId, true, false, false, false, false)
      .then(function(data) {
        res.send(data)
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/userDetails', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/userDetails');
  var username = req.params.profile;
  var userId = req.user.userId;

  conn.query('SELECT *, (SELECT COUNT(*) FROM posts WHERE userId=(SELECT userId FROM users WHERE username=?)) AS numPosts ' +
  'FROM users WHERE username=?', [username, username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result[0];
      res.send({userDetails: {username: username, profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description, isFollowing: row.isFollowing,
        editable: row.userId == userId}});
    }
  })
})

app.get('/api/:profile/stream', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/stream');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Promise.all([getStream(userId, result[0].userId, true, false, false, false, false)])
      .then(function(allData) {
        res.send(allData[0])
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamOriginal', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamOriginal');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Promise.all([getStream(userId, result[0].userId, true, true, false, false, false)])
      .then(function(allData) {
        res.send(allData[0])
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamPosts', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamPosts');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Promise.all([getStream(userId, result[0].userId, true, false, true, false, false)])
      .then(function(allData) {
        res.send(allData[0])
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamPlaylists', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamPlaylists');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Promise.all([getStream(userId, result[0].userId, true, false, false, true, false)])
      .then(function(allData) {
        res.send(allData[0])
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamReposts', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamReposts');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      Promise.all([getStream(userId, result[0].userId, true, false, false, false, true)])
      .then(function(allData) {
        res.send(allData[0])
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/:mediaId/comments', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/' + req.params.mediaId + '/comments');
  var username = req.params.profile;
  var mediaId = req.params.mediaId;
  Promise.all([getPostComments(mediaId)])
  .then(function(allData) {
    res.send({comments: allData[0][mediaId]})
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/:profile/:playlistId/playlistComments', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/' + req.params.playlistId + '/playlistComments');
  var username = req.params.profile;
  var playlistId = req.params.playlistId;
  Promise.all([getPlaylistsComments(playlistId)])
  .then(function(allData) {
    res.send({comments: allData[0][playlistId]})
  }).catch(err => {
    console.log(err);
  })
})

app.post('/api/:profile/edit', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/edit');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('UPDATE users SET profileName = ?, location = ?, description = ? WHERE userId=?',
  [req.body.profileName, req.body.location, req.body.description, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("user edited successfully");
      res.send({message: 'success'})
    }
  })

})

app.post('/api/:profile/updateProfileImage', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/updateProfileImage');
  var username = req.params.profile;
  var userId = req.user.userId;
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      res.send({message: err.message})
    } else {
      var filename = "/profileImages/" + req.file.fieldname + '-' + Date.now() +'.jpg'
      if (req.file.mimetype == 'image/png') {
        Promise.all([updateProfileImage(filename, req.file.buffer, userId)])
        .then(function(allData) {
          console.log("updated profile image successfully");
          res.send(allData[0])
        }).catch(e => {
          console.log(e);
        })
      } else {
        jo.rotate(req.file.buffer, {}, function(error, buffer) {
          if (error && error.code !== jo.errors.no_orientation && error.code !== jo.errors.correct_orientation) {
            console.log('An error occurred when rotating the file: ' + error.message)
            res.send({message: 'fail'})
          } else {
            Promise.all([updateProfileImage(filename, buffer, userId)])
            .then(function(allData) {
              console.log("updated profile image successfully");
              res.send(allData[0])
            }).catch(e => {
              console.log(e);
            })
          }
        })
      }
    }
  })
})

app.post('/api/:profile/follow', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/follow');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result[0]);
      var profileId = result[0].userId
      conn.query('INSERT IGNORE INTO following (followingUserId, followerUserId) VALUES (?, ?)', [profileId, userId], function(err, result) {
        if (err) {
          console.log("insert error");
          console.log(err);
        } else {
          if (!result.insertId) {
            res.send({message: "Already Followed"})
          } else {
            res.send({message: 'success'})
          }
        }
      })
    }
  })
})

app.post('/api/:profile/unfollow', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/unfollow');
  var username = req.params.profile;
  var userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var profileId = result[0].userId
      conn.query('DELETE FROM following WHERE followingUserId=? AND followerUserId=?',
      [profileId, userId], function(err, result) {
        if (err) {
          console.log("delete error");
          console.log(err);
        } else {
          if (!result.affectedRows) {
            res.send({message: 'failed'})
          } else {
            res.send({message: 'success'})
          }
        }
      })
    }
  })
})

app.get('/api/:profile/playlist/:playlistId', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/' + request.params.profile + '/playlist/' + request.params.playlistId);
  var username = request.params.profile;
  var playlistId = request.params.playlistId;
  conn.query('SELECT mediaId, dateTime FROM playlistsLikes WHERE playlistId=? ORDER BY dateTime DESC', playlistId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var mediaIds = []
      var sources = []
      var question_query = ''
      for (var i = 0; i < result.length; i++) {
        mediaIds.push(result[i].mediaId)
        sources.push('posts')
        question_query += '?,'
      }
      question_query = question_query.slice(0, -1)
      Promise.all([getPosts(mediaIds, sources, question_query)])
      .then(function(allData) {
        res.send({posts: allData[0]})
      }).catch(e => {
        console.log(e);
      })
    }
  })
})

app.post('/api/upload', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/upload');
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      res.send({message: err.message})
    } else {
      storeImages(req.files).then(imageMetadata => {
        console.log("imageMetadata is", imageMetadata);
        Promise.all([uploadImageMetadata(req, imageMetadata)])
        .then(function(allData) {
          console.log("Records added successfully");
          res.send({message: 'success'})
        }).catch(e => {
          console.log(e);
          res.send({message: 'fail'})
        })
      })
    }
  })
});

app.post('/api/checkEmail', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/checkEmail');
  var email = req.body.email
  if (validator.isEmail(email)) {
    conn.query('SELECT 1 FROM logins WHERE email=?', [email], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        if (result.length > 0) {
          res.send({message: 'exists'})
        } else {
          res.send({message: 'unique'})
        }
      }
    })
  } else {
    res.send({message: 'fail'})
  }

})


app.post('/api/checkUsername', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/checkUsername');
  var username = req.body.username.toLowerCase()
  conn.query('SELECT 1 FROM logins WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        res.send({message: 'exists'})
      } else {
        res.send({message: 'unique'})
      }
    }
  })
})

app.post('/api/signup', passport.authenticate('local-signup'), (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/signup');
  res.cookie('userId', req.user.userId)
  res.send({message: 'success'});
})

app.post('/api/signin', passport.authenticate('local-login'), function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/signin');
  res.cookie('userId', req.user.userId)
  res.cookie('username', req.user.username)
  const userId = req.user.userId
  conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=? LIMIT 1', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0]);
    }
  })
});

app.post('/api/logout', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/logout');
  req.logout()
  res.clearCookie('userId');
  req.session.destroy();
  res.send({message: 'success'})
})


server.listen(8081, function(){
    console.log('- Server listening on port 8081');
});

function loggedIn(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send({message: 'not logged in'})
  }
}

function getTagDetailsRevised(mediaIds, question_query) {
  return new Promise(function(resolve, reject) {
    var postTags = {}
    if (question_query) {
      conn.query('SELECT * FROM tags WHERE mediaId IN (' + question_query + ')', mediaIds, function(err, result) {
        if (err) {
          return reject("getTagDetailsRevised " + err)
        } else {
          for (var i = 0; i < result.length; i++) {
            var row = result[i]
            var mediaId = row.mediaId
            if (postTags[mediaId]) {
              postTags[mediaId].push({itemType: row.itemType, itemBrand: row.itemBrand,
                itemName: row.itemName, original: row.original, x: row.x, y: row.y})
            } else {
              postTags[mediaId] = [];
              postTags[mediaId].push({itemType: row.itemType, itemBrand: row.itemBrand,
                itemName: row.itemName, original: row.original, x: row.x, y: row.y})
            }
          }
          return resolve(postTags);
        }
      })
    } else {
      return resolve(postTags)
    }
  })
}

function getPlaylistsComments(playlistId) {
  return getComments(playlistId, 'playlistsComments', 'playlistId')
}

function getPostComments(mediaId) {
  return getComments(mediaId, 'comments', 'mediaId')
}

function getComments(id, commentsTable, idType) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT ' + commentsTable + '.*, a.profileName as profileName, a.userName as username ' +
    'FROM ' + commentsTable + ' INNER JOIN users AS a ON a.userId = ' + commentsTable + '.userId ' +
    'WHERE ' + idType + ' = ? ORDER BY dateTime DESC', [id], function(err, result) {
      if (err) {
        return reject("getComments " + err)
      } else {
        var comments = {};
        for(var i = 0; i < result.length; i++) {
          var row = result[i]
          var id = 0;
          if (commentsTable == 'comments') {
            id = row.mediaId
          } else {
            id = row.playlistId
          }

          if (comments[id]) {
            comments[id].push({username: row.username, profileName: row.profileName,
              comment: row.comment, dateTime: row.dateTime})
          } else {
            comments[id] = [];
            comments[id].push({username: row.username, profileName: row.profileName,
              comment: row.comment, dateTime: row.dateTime})
          }
        }
        return resolve(comments)
      }
    })
  })
}

function getPlaylistsPosts(playlistIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT a.*, playlistId, b.username AS username , b.profileName AS profileName, b.profile_image_src AS profile_image_src, b.location AS location, b.followers AS userFollowers, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=?1 AND followingUserId = b.userId) > 0) AS userFollowed, ((SELECT COUNT(*) FROM following WHERE followerUserId=b.userId AND followingUserId = ?1) > 0) AS followsYou, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=?1 AND mediaId = a.mediaId) > 0) AS reposted, ((SELECT COUNT(*) FROM likes WHERE userId=?1 AND mediaId = a.mediaId) > 0) AS liked ' +
    'FROM playlistsPosts INNER JOIN posts AS a ON a.mediaId = playlistsPosts.mediaId INNER JOIN users AS b ON b.userId = a.userId ' +
    'WHERE playlistsPosts.playlistId IN (' + question_query + ') ORDER BY dateTime DESC', playlistIds, function(err, result) {
      if (err) {
        return reject("getPlaylistsPosts " + err);
      }
      var mediaIds = []
      question_query = ''
      for (var i = 0; i < result.length; i++) {
        mediaIds.push(result[i].mediaId)
        question_query += '?' + (i+1) + ','
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getTagDetailsRevised(mediaIds), getPostComments(mediaIds)])
      .then(function(allData) {
        var playlistsPosts = {}
        for (var i = 0; i < result.length; i++) {
          var row = result[i]
          var playlistId = row.playlistId
          var post = {mediaId:row.mediaId, playlistId: playlistId, views:row.views, likes:row.likes,
            reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
            title:row.title, genre:row.genre, description:row.description, location: row.location,
            original: row.original, username: row.username, profileName: row.profileName,
            profile_image_src: row.profile_image_src, userFollowers: row.userFollowers,
            tags:allData[0][row.mediaId], comments: allData[1][row.mediaId], uploadDate: row.dateTime,
            liked: row.liked, reposted: row.reposted, userFollowed: row.userFollowed, followsYou: row.followsYou}
          if (playlistsPosts[playlistId]) {
            playlistsPosts[playlistId].push(post)
          } else {
            playlistsPosts[playlistId] = []
            playlistsPosts[playlistId].push(post)
          }
        }
        return resolve(playlistsPosts)
      }).catch(err => {
        return reject(err)
      })
    })
  })
}

function postTagsFromUploadRevised(mediaId, inputTags) {
  return new Promise(function(resolve, reject) {
    var question_query = ''
    var insertQuery = [];
    for (var i = 0; i < inputTags.length; i++) {
      insertQuery.push(mediaId, inputTags[i].itemType, inputTags[i].itemName, inputTags[i].itemBrand, inputTags[i].itemLink.replace(/^https?\:\/\//i, ""),
        inputTags[i].original, inputTags[i].x, inputTags[i].y, inputTags[i].imageIndex);
      question_query += '(?, ?, ?, ?, ?, ?, ?, ?, ?),';
    }
    question_query = question_query.slice(0, -1);
    conn.query('INSERT INTO tags (mediaId, itemType, itemName, itemBrand, itemLink, original, x, y, imageIndex) VALUES ' + question_query, insertQuery, function(err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve({message: 'success'})
      }
    })
  });
}

function insertPostImages(mediaId, imageMetadata, dimensions) {
  return new Promise(function(resolve, reject) {
    var question_query = ''
    var insertQuery = [];
    for (var i = 0; i < imageMetadata.length; i++) {
      insertQuery.push(mediaId, imageMetadata[i].filename, imageMetadata[i].height, imageMetadata[i].width,
        dimensions[i].display.height, dimensions[i].display.width, imageMetadata[i].order);
      question_query += '(?, ?, ?, ?, ?, ?, ?),';
    }
    question_query = question_query.slice(0, -1);
    conn.query('INSERT INTO postsImages (mediaId, imageUrl, height, width, displayHeight, displayWidth, imageIndex) VALUES ' + question_query, insertQuery, function(err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve({message: 'success'})
      }
    })
  });
}

function getStream(cookieUser, userId, isProfile, original, posts, playlists, reposts) {
  return new Promise(function(resolve, reject) {
    var profileToggle1 = ''
    var profileToggle2 = ''
    var profileToggle3 = ''
    var profileToggle4 = ''

    if (!isProfile) {
      profileToggle1 = 'b.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      profileToggle2 = 'a.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      profileToggle3 = 'reposts.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      profileToggle4 = 'posts.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
    }

    var originalToggle1 = ''
    var originalToggle2 = ''
    if (original) {
      originalToggle1 = 'AND posts.original = 1'
      originalToggle2 = 'AND a.original = 1'
    }

    var userPlaylistReposts = 'SELECT null as mediaId, a.playlistId, a.title, a.url, a.genre, a.public, null as original, null as imageUrls, ' +
    'null AS views, a.likes, a.reposts, a.comments, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, b.dateTime as orderTime, ' +
    'b.username AS repost_username, b.profileName AS repost_profileName, b.profile_image_src AS repost_profile_image_src, a.username, a.profileName, a.profile_image_src, null AS postTags, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', f.mediaId, \'title\', f.title, \'original\',f.original, \'username\', f.username, \'profileName\', f.profileName, \'url\', f.url, \'imageUrls\', postsImages.imageUrls, \'playlistIndex\', e.playlistIndex)) AS playlistPosts, ' +
    'true AS reposted, ' +
    '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ' +
    '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster FROM playlistsReposts AS b ' +
    'INNER JOIN playlists AS a ON a.playlistId = b.playlistId ' +
    'LEFT JOIN playlistsPosts AS e ON e.playlistId = b.playlistId ' +
    'LEFT JOIN posts AS f ON f.mediaId = e.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) postsImages ON postsImages.mediaId = f.mediaId ' +
    'WHERE ' + profileToggle1 + 'b.userId=:userId GROUP BY b.repostId'

    var userPlaylistPosts = 'SELECT null as mediaId, a.playlistId, a.title, a.url, a.genre, a.public, null as original, null as imageUrls, ' +
    'null AS views, a.likes, a.reposts, a.comments, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, a.dateTime as orderTime, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, a.username, a.profileName, a.profile_image_src, null AS postTags, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', c.mediaId, \'title\', c.title, \'original\', c.original, \'views\', c.views, \'username\', c.username, \'profileName\', c.profileName, \'url\', c.url, \'imageUrls\', d.imageUrls, \'playlistIndex\', b.playlistIndex)) AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ' +
    '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster FROM playlists AS a ' +
    'LEFT JOIN playlistsPosts AS b ON b.playlistId = a.playlistId ' +
    'LEFT JOIN posts AS c ON c.mediaId = b.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) d ON d.mediaId = c.mediaId ' +
    'WHERE ' + profileToggle2 + 'a.userId=:userId GROUP BY a.playlistId'

    var userReposts = 'SELECT a.mediaId, null as playlistId, a.title, a.url, a.genre, null, a.original, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', e.imageUrl, \'width\', e.width, \'height\', e.height, \'imageIndex\', e.imageIndex)) AS imageUrls, a.views, ' +
    'a.likes, a.reposts, a.comments, null as playlistFollowers, a.description, a.dateTime AS uploadDate, reposts.dateTime as orderTime, ' +
    'reposts.username as repost_username, reposts.profileName as repost_profileName, reposts.profile_image_src AS repost_profile_image_src, ' +
    'a.username, a.profileName, a.profile_image_src, d.postTags AS postTags, null AS playlistPosts, ' +
    'true AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = a.mediaId) > 0) AS liked, ' +
    'null AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster FROM reposts ' +
    'INNER JOIN posts AS a ON a.mediaId = reposts.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'itemX\', x, \'itemY\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) d ON d.mediaId = reposts.mediaId ' +
    'INNER JOIN postsImages AS e ON e.mediaId = reposts.mediaId ' +
    'WHERE (' + profileToggle3 + 'reposts.userId=:userId) ' + originalToggle2 + ' GROUP BY reposts.repostId'

    var userPosts = 'SELECT posts.mediaId, null as playlistId, title, url, genre, null, posts.original, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', e.imageUrl, \'width\', e.width, \'height\', e.height, \'imageIndex\', e.imageIndex)) AS imageUrls, views, likes, reposts, comments, ' +
    'null as playlistFollowers, posts.description, posts.dateTime AS uploadDate, posts.dateTime as orderTime, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, ' +
    'username, profileName, profile_image_src, tags.postTags AS postTags, null AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:cookieUser AND mediaId = posts.mediaId) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = posts.mediaId) > 0) AS liked, ' +
    'null AS followed, (posts.userId = :cookieUser) AS isPoster FROM posts ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'itemX\', x, \'itemY\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) tags ON tags.mediaId = posts.mediaId ' +
    'LEFT JOIN postsImages AS e ON e.mediaId = posts.mediaId ' +
    'WHERE (' + profileToggle4 + 'posts.userId=:userId) ' + originalToggle1 + ' GROUP BY posts.mediaId'

    var orderBy = ' ORDER BY orderTime DESC LIMIT 20'

    var queryString = ''
    if (original) {
      queryString = userReposts + ' UNION ALL ' + userPosts + orderBy
    } else if (posts) {
      queryString = userPosts + orderBy
    }else if (playlists) {
      queryString = userPlaylistPosts + orderBy
    } else if (reposts) {
      queryString = userPlaylistReposts + ' UNION ALL ' + userReposts + orderBy
    } else {
      queryString = userPlaylistReposts + ' UNION ALL ' + userPlaylistPosts + ' UNION ALL ' + userReposts + ' UNION ALL ' + userPosts + orderBy
    }

    conn.query(queryString, {cookieUser: cookieUser, userId: userId}, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        var stream = []
        for (var i = 0; i < result.length; i++) {
          var row = result[i]
          var mediaId = row.mediaId
          var playlistId = row.playlistId
          var postTags = []
          if (row.postTags) {
            postTags = JSON.parse(row.postTags)
          }
          if (mediaId) {
              var post = {mediaId:row.mediaId, views:row.views, likes:row.likes,
              reposts:row.reposts, comments:row.comments, imageUrls: JSON.parse(row.imageUrls),
              title:row.title, url: row.url, genre:row.genre, description:row.description,
              date:row.dateTime, original: row.original, username: row.username,
              profileName: row.profileName, profile_image_src: row.profile_image_src,
              tags: postTags, uploadDate: row.uploadDate,
              repost_username: row.repost_username, repost_profileName: row.repost_profileName,
              repost_profile_image_src: row.repost_profile_image_src, repostDate: row.orderTime,
              reposted: row.reposted, liked: row.liked, isPoster: row.isPoster}
            stream.push(post)
          } else if (playlistId) {
            var playlist = {playlistId:row.playlistId, likes:row.likes, reposts:row.reposts, url: row.url,
              genre: row.genre, comments:row.comments, followers: row.playlistFollowers, title:row.title,
              description:row.description, uploadDate:row.uploadDate, public: row.public,
              repost_username: row.repost_username, repost_profileName: row.repost_profileName,
              repost_profile_image_src: row.repost_profile_image_src, repostDate: row.orderTime,
              username: row.username, profileName: row.profileName, profile_image_src: row.profile_image_src,
              posts: JSON.parse(row.playlistPosts), reposted: row.reposted,
              liked: row.liked, followed: row.followed, isPoster: row.isPoster}
            stream.push(playlist)
          }
        }
        return resolve({stream: stream})
      }
    })
  })
}

function addToCollection(req, table, idType) {
  return new Promise(function(resolve, reject) {
    var userId = req.user.userId;
    var id = 0
    if (idType == 'mediaId') {
      id = req.body.mediaId
    } else {
      id = req.body.playlistId
    }
    var postsOrPlaylists = ''
    var likesOrReposts = ''
    if (idType == 'mediaId') {
      postsOrPlaylists = 'posts'
      if (table == 'likes') {
        likesOrReposts = 'likes'
      } else {
        likesOrReposts = 'reposts'
      }
    } else {
      postsOrPlaylists = 'playlists'
      if (table == 'playlistsLikes') {
        likesOrReposts = 'likes'
      } else {
        likesOrReposts = 'reposts'
      }
    }
    conn.query('INSERT IGNORE INTO ' + table + ' (' + idType  + ', userId) VALUES (?,?)',
    [id, userId], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        if (!result.insertId) {
          return resolve({message: "Already " + likesOrReposts})
        } else {
          console.log(table + "ed post successfully");
          return resolve({message: "success"})
        }
      }
    })
  })
}

function removeFromCollection(req, table, idType) {
  return new Promise(function(resolve, reject) {
    var userId = req.user.userId;
    var id = 0
    if (idType == 'mediaId') {
      id = req.body.mediaId;
    } else {
      id = req.body.playlistId
    }
    var postsOrPlaylists = ''
    var likesOrReposts = ''
    if (idType == 'mediaId') {
      postsOrPlaylists = 'posts'
      if (table == 'likes') {
        likesOrReposts = 'likes'
      } else {
        likesOrReposts = 'reposts'
      }
    } else {
      postsOrPlaylists = 'playlists'
      if (table == 'playlistsLikes') {
        likesOrReposts = 'likes'
      } else {
        likesOrReposts = 'reposts'
      }
    }
    conn.query('DELETE FROM ' + table + ' WHERE ' + idType + '=? AND userId=?', [id, userId], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        if (!result.affectedRows) {
          return resolve({message: "Already " + likesOrReposts})
        } else {
          console.log('un' + table + "ed post successfully");
          return resolve({message: "success"})
        }
      }
    })
  })
}

function uploadImageMetadata(req, imageMetadata) {
  return new Promise(function(resolve, reject) {
    var insertQuery = [req.user.userId, req.body.title, req.body.url, req.body.genre.toLowerCase(), req.body.original, req.body.description];
    conn.query('INSERT INTO posts (userId, title, url, genre, original, description) VALUES (?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
      if (err) {
        console.log("upload error");
        return reject(err);
      } else {
        if (JSON.parse(req.body.inputTags).length > 0) {
          Promise.all([postTagsFromUploadRevised(result.insertId, JSON.parse(req.body.inputTags)), insertPostImages(result.insertId, imageMetadata, JSON.parse(req.body.dimensions))])
          .then(function(allData) {
            return resolve({message: 'success'})
          }).catch(e => {
            return reject(e);
          })
        } else {
          Promise.all([insertPostImages(result.insertId, imageMetadata, JSON.parse(req.body.dimensions))])
          .then(function(allData) {
            return resolve({message: 'success'})
          }).catch(e => {
            return reject(e);
          })
        }
      }
    })
  });
}

function updateProfileImage(filename, buffer, userId) {
  return new Promise(function(resolve, reject) {
    fs.writeFile("public" + filename, buffer, function(err) {
      if (err) {
        return reject(err)
      } else {
        conn.query('SELECT profile_image_src FROM users WHERE userId=?', [userId], function(err, result) {
          if (err) {
            return reject(err);
          } else {
            var oldFilename = result[0].profile_image_src
            conn.query('UPDATE users SET profile_image_src = ? WHERE userId=?', [filename, userId], function(err, result) {
              if (err) {
                return reject(err)
              } else {
                if (oldFilename) {
                  fs.unlink("public" + oldFilename, function(err) {
                    if (err) {
                      return reject(err)
                    } else {
                      return resolve({message: 'success'})
                    }
                  })
                } else {
                  return resolve({message: 'success'})
                }
              }
            })
          }
        })
      }
    })
  })
}

function generateUsername(username) {
  return new Promise(function(resolve, reject) {
    var uniqueUsername = (username + Math.floor(Math.random() * 1000)).toLowerCase()
    console.log("uniqueUsername is", uniqueUsername);
    conn.query('SELECT 1 FROM logins WHERE username=?', [uniqueUsername], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        if (result.length > 0) {
          resolve(generateUsername(username))
        } else {
          console.log("username is unique");
          return resolve(uniqueUsername)
        }
      }
    })
  })
}

function getTimePeriod(timePeriod) {
  switch (timePeriod) {
    //24 hours ago
    case 0:
      return new Date(Date.now() - (24 * 60 * 60 * 1000))
      break;
    //1 week ago
    case 1:
      return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
      break;
    //1 month ago
    case 2:
      return new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
      break;
    //1 year ago
    case 3:
      return new Date(Date.now() - (365 * 24 * 60 * 60 * 1000))
      break;
    //all time
    case 4:
      return null
      break;
    default:
      return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
  }
}

function orderFollowers(sortBy) {
  switch (sortBy) {
    case 0:
      return 'ORDER BY following.dateTime'
      break;
    case 1:
      return 'ORDER BY a.followers'
      break;
    default:
      return 'ORDER BY following.dateTime'
  }
}

async function storeImages(files) {
  var imageMetadata = []
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var filename = "/images/" + file.fieldname + '-' + Date.now() +'.jpg'
    var metadata = await storeImagesHelper(file, filename, i)
    imageMetadata.push(metadata)
  }
  return imageMetadata
}

function storeImagesHelper(file, filename, index) {
  return new Promise(function(resolve, reject) {
    var dimensions = sizeOf(file.buffer);
    if (file.mimetype == 'image/png') {
      fs.writeFile("public" + filename, file.buffer, function(err) {
        if (err) {
          return reject(err);
        } else {
          return resolve({filename: filename, height: dimensions.height, width: dimensions.width, order: index})
        }
      })
    } else {
      jo.rotate(file.buffer, {}, function(error, buffer) {
        if (error && error.code !== jo.errors.no_orientation && error.code !== jo.errors.correct_orientation) {
          console.log('An error occurred when rotating the file: ' + error.message)
          return reject(error)
        } else {
          fs.writeFile("public" + filename, buffer, function(err) {
            if (err) {
              return reject(err)
            } else {
              return resolve({filename: filename, height: dimensions.height, width: dimensions.width, order: index})
            }
          })
        }
      })
    }
  })
}

function exploreHelper(type, userId, timePeriod) {
  return new Promise(function(resolve, reject) {
    var hotScore = ''
    var orderBy = ''
    switch (type) {
      //hot
      case 0:
        hotScore = '(LOG(10, GREATEST(1, posts.views/10 + posts.likes)) + UNIX_TIMESTAMP(posts.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
        break;
      //new
      case 1:
        orderBy = 'ORDER BY posts.dateTime '
        break;
      //top
      case 2:
        orderBy = 'ORDER BY posts.views '
        break;
      //random
      case 3:
        orderBy = 'ORDER BY posts.views '
        break;
      default:
        hotScore = '(LOG(10, GREATEST(1, posts.views/10 + posts.likes)) + UNIX_TIMESTAMP(posts.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
    }

    var values = {userId: userId}
    var timePeriodQuery = ''
    if (timePeriod) {
      timePeriodQuery = 'WHERE posts.dateTime BETWEEN :timePeriod AND :now '
      values = {userId: userId, now: timePeriod.now, timePeriod: timePeriod.timePeriod}
    }

    conn.query('SELECT posts.*, posts.dateTime AS uploadDate, a.imageUrls, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' + hotScore +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = posts.mediaId) > 0) AS liked FROM posts ' +
    'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) a ON a.mediaId = posts.mediaId ' +
    'INNER JOIN users AS b ON b.userId = posts.userId ' + timePeriodQuery + 'GROUP BY mediaId ' + orderBy + 'DESC LIMIT 24', values, function(err, result) {
      if (err) {
        console.log(err);
        return reject(err)
      } else {
        for (var i = 0; i < result.length; i++) {
          result[i].imageUrls = JSON.parse(result[i].imageUrls)
        }
        return resolve(result)
      }
    })
  })
}
