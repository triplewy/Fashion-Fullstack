// use strict compiling
"use strict";
require('dotenv').config()
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var mysql = require('mysql')
var named = require('named-placeholders')();
var path = require('path');
var colors = require('colors');
var aws = require('aws-sdk')
var multer = require('multer');
var multerS3 = require('multer-s3')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var RedditStrategy = require('passport-reddit').Strategy
var crypto = require('crypto')
var uuidv1 = require('uuid/v1');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('redis')
var bcrypt = require('bcrypt');
var jo = require('jpeg-autorotate')
var sharp = require('sharp')
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
  host: process.env.REDIS_HOST,
  port: 6379,
  client: client
})
var POLLING_INTERVAL = 10000

var app = express();
var s3 = new aws.S3()
var server = http.createServer(app)
var io = socketIO(server)


app.use(cors({credentials: true, origin: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false
  }
})

var passportInit = passport.initialize();
var passportSession = passport.session();

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.use(function(socket, next) {
  passportInit(socket.request, socket.request.res, next);
});

io.use(function(socket, next) {
  passportSession(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware)
app.use(passportInit)
app.use(passportSession)

passport.serializeUser(function(user, done) {
  console.log("serializeUser userId is", user);
	done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})


// setTimeout(function () {
//   io.use(passportSocketIo.authorize({
//     cookieParser: cookieParser,       // the same middleware you registrer in express
//     key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
//     secret:       process.env.COOKIE_SECRET,    // the session_secret to parse the cookie
//     store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
//     success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
//     fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
//   }));
// }, 1000)
//
//
//
// function onAuthorizeSuccess(data, accept){
//   accept(null, true);
// }
//
// function onAuthorizeFail(data, message, error, accept){
//   if (error)
//     throw new Error(message);
//   console.log('failed connection to socket.io:', message);
//   accept(null, false);
// }

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
            conn.query('INSERT INTO logins (username, email, passwordHash, verificationHash, userId) VALUES (?,?,?,?,?)',
              [username.toLowerCase(), email, passwordHash, verificationHash, userId], function(err, result) {
              if (err) {
                return done(err)
              } else {
                return done(null, {userId: userId, username: username.toLowerCase()})
                // var link = "localhost:3000/verify?id=" + verificationHash;
                // var mailOptions={
                //   to : email,
                //   subject : "Please confirm your Email account",
                //   html : "Hello,<br> Please click on the link to verify your email.<br><a href="+ link +">" + link + "</a>"
                // }
                // smtpTransport.sendMail(mailOptions, function(err, response) {
                //   if (err) {
                //     return done(err)
                //   } else {
                //     console.log("Message sent");
                //     return done(null, {userId: userId, username: username.toLowerCase()})
                //   }
                // })
              }
            })
          }
        })
      })
    })
  }
))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.SERVER_DNS + "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    conn.query('SELECT * FROM logins WHERE networkId=?', [profile.id], function(err, result) {
       if (err) {
         return done(err)
       }
       if (result.length > 0) {
         return done(null, {userId: result[0].userId, username: result[0].username})
       }
       var username = profile.displayName.replace(/\s+/g, '').toLowerCase();
       generateUsername(username)
       .then(function(data) {
         conn.query('INSERT INTO users (username, profileName) VALUES (?,?)',
         [data, profile.displayName], function(err, result) {
           if (err) {
             return done(err)
           }
           var userId = result.insertId
           conn.query('INSERT INTO logins (networkId, network, accessToken, username, email, verified, userId) VALUES (?,?,?,?,?,?,?)',
           [profile.id, profile.provider, accessToken, data, profile.emails[0].value, true, userId], function(err, result) {
             if (err) {
               return done(err)
             }
             return done(null, {userId: userId, username: data})
           })
         })
       })
     })
   }
))

passport.use(new RedditStrategy({
    clientID: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    callbackURL: process.env.SERVER_DNS + "/auth/reddit/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    conn.query('SELECT * FROM logins WHERE networkId=?', [profile.id], function(err, result) {
       if (err) {
         return done(err)
       }
       if (result.length > 0) {
         return done(null, {userId: result[0].userId, username: result[0].username})
       }
       var username = profile.name.replace(/\s+/g, '').toLowerCase();
       generateUsername(username)
       .then(function(data) {
         conn.query('INSERT INTO users (username, profileName) VALUES (?,?)',
         [data, profile.name], function(err, result) {
           if (err) {
             return done(err)
           }
           const userId = result.insertId
           conn.query('INSERT INTO logins (networkId, network, accessToken, username, verified, userId) VALUES (?,?,?,?,?,?)',
           [profile.id, "reddit", accessToken, data, true, userId], function(err, result) {
             if (err) {
               return done(err)
             }
             return done(null, {userId: userId, username: data})
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
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE,
  timezone: 'utc'
});

/*
conn.query('SET foreign_key_checks = 0')
conn.query('DROP TABLE IF EXISTS users')
conn.query('DROP TABLE IF EXISTS posts')
conn.query('DROP TABLE IF EXISTS postsImages')
conn.query('DROP TABLE IF EXISTS playlists')
conn.query('DROP TABLE IF EXISTS tags');
conn.query('DROP TABLE IF EXISTS reposts');
conn.query('DROP TABLE IF EXISTS likes');
conn.query('DROP TABLE IF EXISTS views');
conn.query('DROP TABLE IF EXISTS playlistsViews');
conn.query('DROP TABLE IF EXISTS comments');
conn.query('DROP TABLE IF EXISTS playlistsPosts');
conn.query('DROP TABLE IF EXISTS playlistsFollowers');
conn.query('DROP TABLE IF EXISTS playlistsReposts');
conn.query('DROP TABLE IF EXISTS playlistsLikes');
conn.query('DROP TABLE IF EXISTS playlistsComments');
conn.query('DROP TABLE IF EXISTS postsNotifications')
conn.query('DROP TABLE IF EXISTS playlistsNotifications')
conn.query('DROP TABLE IF EXISTS followingNotifications')
conn.query('DROP TABLE IF EXISTS playlistsPostsNotifications')
conn.query('DROP TABLE IF EXISTS following');
conn.query('DROP TABLE IF EXISTS logins')
conn.query('DROP TABLE IF EXISTS linksClicks')
conn.query('DROP TABLE IF EXISTS profilesVisits')
conn.query('DROP PROCEDURE IF EXISTS markNotificationsAsRead')
conn.query('SET foreign_key_checks = 1')

conn.query('CREATE TABLE IF NOT EXISTS users (userId INTEGER AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'location TEXT, followers INTEGER NOT NULL DEFAULT 0, following INTEGER NOT NULL DEFAULT 0, numPosts INTEGER NOT NULL DEFAULT 0, description TEXT, createdDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)')

conn.query('CREATE TABLE IF NOT EXISTS logins (loginId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, network TEXT, networkId TEXT, accessToken TEXT, username VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) UNIQUE, ' +
'passwordHash CHAR(60), verificationHash CHAR(60), verified BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE);')

conn.query('CREATE TABLE IF NOT EXISTS posts (mediaId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'title VARCHAR(255) NOT NULL, url VARCHAR(255) NOT NULL, genre TEXT, original BOOLEAN, ' +
'views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE, UNIQUE(userId, url));')

conn.query('CREATE TABLE IF NOT EXISTS postsImages (imageId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, imageUrl VARCHAR(255) NOT NULL UNIQUE, imageIndex INTEGER NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE);')

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT NOT NULL, profile_image_src VARCHAR(255), ' +
'title VARCHAR(255), url VARCHAR(255) NOT NULL, genre TEXT, public BOOLEAN, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, ' +
'followers INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, displayTime DATETIME, postsAdded INTEGER DEFAULT 0, ' +
'dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY(username) REFERENCES users(username) ON UPDATE CASCADE, UNIQUE(url, userId))')

conn.query('CREATE TABLE IF NOT EXISTS followingNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS postsNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, mediaId INTEGER NOT NULL, activity INTEGER NOT NULL, comment TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS playlistsNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, playlistId INTEGER NOT NULL, activity INTEGER NOT NULL, comment TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId), FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE)')

conn.query('CREATE TABLE IF NOT EXISTS playlistsPostsNotifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, senderId INTEGER NOT NULL, receiverId INTEGER NOT NULL, playlistId INTEGER NOT NULL, mediaId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ' +
'FOREIGN KEY (senderId) REFERENCES users(userId), FOREIGN KEY (receiverId) REFERENCES users(userId), FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE)')

conn.query('CREATE TABLE IF NOT EXISTS tags (tagId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, itemType TEXT NOT NULL, itemName TEXT, itemBrand TEXT, itemLink VARCHAR(255), original BOOLEAN NOT NULL DEFAULT FALSE, x INTEGER NOT NULL, y INTEGER NOT NULL, imageIndex INTEGER NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE)');

conn.query('CREATE TABLE IF NOT EXISTS reposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, mediaUserId INTEGER NOT NULL, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT, profile_image_src VARCHAR(255), dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, ' +
'FOREIGN KEY(mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, FOREIGN KEY (mediaUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY(username) REFERENCES users(username) ON UPDATE CASCADE, UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS likes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, mediaUserId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, FOREIGN KEY (mediaUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS views (viewId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, reposterId INTEGER, viewerId INTEGER, ' +
// 'viewerId INTEGER NOT NULL, ' +
'mediaUserId INTEGER NOT NULL, IP_Address TEXT, explore BOOLEAN, dateTime DATETIME NOT NULL, ' +
// 'FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, ' +
'FOREIGN KEY (reposterId) REFERENCES users(userId), ' +
// 'FOREIGN KEY (viewerId) REFERENCES users(userId), ' +
'FOREIGN KEY (mediaUserId) REFERENCES users(userId)' +
// ', UNIQUE(mediaId, viewerId, dateTime)' +
')');

conn.query('CREATE TABLE IF NOT EXISTS comments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, mediaUserId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, FOREIGN KEY (mediaUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistPostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, mediaId INTEGER NOT NULL, playlistIndex INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY(mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, UNIQUE KEY (playlistId, mediaId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistFollowId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, playlistUserId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY (playlistUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsReposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, playlistUserId INTEGER NOT NULL, userId INTEGER NOT NULL, username VARCHAR(255) NOT NULL, profileName TEXT, profile_image_src VARCHAR(255), dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, ' +
'FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY (playlistUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY(username) REFERENCES users(username) ON UPDATE CASCADE, UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsLikes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, playlistUserId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY (playlistUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsComments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, playlistUserId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId) ON DELETE CASCADE, FOREIGN KEY (playlistUserId) REFERENCES users(userId), FOREIGN KEY (userId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS playlistsViews (viewId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, mediaId INTEGER NOT NULL, reposterId INTEGER, viewerId INTEGER, mediaUserId INTEGER NOT NULL, playlistUserId INTEGER NOT NULL, IP_Address TEXT, explore BOOLEAN, dateTime DATETIME NOT NULL, ' +
// 'FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), ' +
// 'FOREIGN KEY (mediaId) REFERENCES posts(mediaId) ON DELETE CASCADE, ' +
'FOREIGN KEY (reposterId) REFERENCES users(userId), ' +
// 'FOREIGN KEY (viewerId) REFERENCES users(userId), ' +
'FOREIGN KEY (mediaUserId) REFERENCES users(userId), FOREIGN KEY (playlistUserId) REFERENCES users(userId)' +
// ', UNIQUE(mediaId, viewerId, dateTime)' +
')');

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

conn.query('CREATE TRIGGER before_likes_insert BEFORE INSERT ON likes FOR EACH ROW BEGIN ' +
'SET NEW.mediaUserId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); END; ')

conn.query('CREATE TRIGGER after_likes_insert AFTER INSERT ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 0, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_likes_delete AFTER DELETE ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=0; END;')

conn.query('CREATE TRIGGER before_reposts_insert BEFORE INSERT ON reposts FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'IF (SELECT COUNT(*) FROM posts WHERE userId=NEW.userId AND mediaId=NEW.mediaId > 0) THEN ' +
'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot repost own track\', MYSQL_ERRNO = 1001; ' +
'ELSE ' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM users WHERE userId = NEW.userId; ' +
'SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; ' +
'SET NEW.mediaUserId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); ' +
'END IF; END;')

conn.query('CREATE TRIGGER after_reposts_insert AFTER INSERT ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 1, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_reposts_update AFTER UPDATE ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId = NEW.mediaId AND active = 1) WHERE mediaId = NEW.mediaId; ' +
'IF (NEW.active = 0) THEN DELETE FROM postsNotifications WHERE senderId=NEW.userId AND mediaId=NEW.mediaId AND activity=1; END IF; END;')

// conn.query('CREATE TRIGGER after_reposts_delete AFTER DELETE ON reposts FOR EACH ROW BEGIN ' +
// 'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
// 'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=1; END;')

conn.query('CREATE TRIGGER before_comments_insert BEFORE INSERT ON comments FOR EACH ROW BEGIN ' +
'SET NEW.mediaUserId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); END; ')

conn.query('CREATE TRIGGER after_comments_insert AFTER INSERT ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO postsNotifications (senderId, receiverId, mediaId, activity, comment, dateTime) VALUES (NEW.userId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, 2, NEW.comment, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_comments_delete AFTER DELETE ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; ' +
'DELETE FROM postsNotifications WHERE senderId=OLD.userId AND mediaId=OLD.mediaId AND activity=2; END;')

conn.query('CREATE TRIGGER before_playlistsLikes_insert BEFORE INSERT ON playlistsLikes FOR EACH ROW BEGIN ' +
'SET NEW.playlistUserId = (SELECT userId FROM playlists WHERE playlistId = NEW.playlistId LIMIT 1); END; ')

conn.query('CREATE TRIGGER after_playlistsLikes_insert AFTER INSERT ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 0, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsLikes_delete AFTER DELETE ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=0; END;')

conn.query('CREATE TRIGGER before_playlistsReposts_insert BEFORE INSERT ON playlistsReposts FOR EACH ROW BEGIN ' +
'DECLARE newUsername VARCHAR(255); DECLARE newProfileName TEXT; DECLARE new_profile_image_src VARCHAR(255); ' +
'IF (SELECT COUNT(*) FROM playlists WHERE userId=NEW.userId AND playlistId=NEW.playlistId > 0) THEN ' +
'SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot repost own playlist\', MYSQL_ERRNO = 1001; '+
'ELSE ' +
'SET NEW.playlistUserId = (SELECT userId FROM playlists WHERE playlistId = NEW.playlistId LIMIT 1);' +
'SELECT username, profileName, profile_image_src INTO newUsername, newProfileName, new_profile_image_src FROM ' +
'users WHERE userId = NEW.userId; SET NEW.username = newUsername; SET NEW.profileName = newProfileName; SET NEW.profile_image_src = new_profile_image_src; ' +
'END IF; END;')

conn.query('CREATE TRIGGER after_playlistsReposts_insert AFTER INSERT ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 1, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsReposts_update AFTER UPDATE ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId = NEW.playlistId AND active = 1) WHERE playlistId = NEW.playlistId; ' +
'IF (NEW.active = 0) THEN DELETE FROM playlistsNotifications WHERE senderId=NEW.userId AND playlistId=NEW.playlistId AND activity=1; END IF; END;')

// conn.query('CREATE TRIGGER after_playlistsReposts_delete AFTER DELETE ON playlistsReposts FOR EACH ROW BEGIN ' +
// 'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
// 'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=1; END;')

conn.query('CREATE TRIGGER before_playlistsFollowers_insert BEFORE INSERT ON playlistsFollowers FOR EACH ROW BEGIN ' +
'SET NEW.playlistUserId = (SELECT userId FROM playlists WHERE playlistId = NEW.playlistId LIMIT 1); END; ')

conn.query('CREATE TRIGGER after_playlistsFollowers_insert AFTER INSERT ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 3, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsFollowers_delete AFTER DELETE ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=3; END;')

conn.query('CREATE TRIGGER before_playlistsComments_insert BEFORE INSERT ON playlistsComments FOR EACH ROW BEGIN ' +
'SET NEW.playlistUserId = (SELECT userId FROM playlists WHERE playlistId = NEW.playlistId LIMIT 1); END; ')

conn.query('CREATE TRIGGER after_playlistsComments_insert AFTER INSERT ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsNotifications (senderId, receiverId, playlistId, activity, comment, dateTime) VALUES (NEW.userId, (SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, 2, NEW.comment, NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsComments_delete AFTER DELETE ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; ' +
'DELETE FROM playlistsNotifications WHERE senderId=OLD.userId AND playlistId=OLD.playlistId AND activity=2; END;')

// conn.query('CREATE TRIGGER after_postNotifications_update AFTER UPDATE ON postsNotifications FOR EACH ROW BEGIN ' +
// 'UPDATE playlistsNotifications SET unread=0 WHERE receiverId=NEW.receiverId; ' +
// 'UPDATE followingNotifications SET unread=0 WHERE receiverId=NEW.receiverId; END;')

conn.query('CREATE TRIGGER before_views_insert BEFORE INSERT ON views FOR EACH ROW BEGIN ' +
'DECLARE mediaUserId INTEGER; SET mediaUserId = (SELECT userId FROM posts WHERE mediaId = NEW.mediaId LIMIT 1); ' +
'IF (NEW.viewerId != mediaUserId OR NEW.viewerId IS NULL) THEN SET NEW.mediaUserId = mediaUserId; END IF; END;')

conn.query('CREATE TRIGGER after_views_insert AFTER INSERT ON views FOR EACH ROW BEGIN ' +
// 'UPDATE posts SET views = views + 1 WHERE mediaId=NEW.mediaId; END;')
'UPDATE posts SET views = (SELECT COUNT(*) FROM views WHERE mediaId=NEW.mediaId) + (SELECT COUNT(*) FROM playlistsViews WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; END;')

conn.query('CREATE TRIGGER before_playlistsViews_insert BEFORE INSERT ON playlistsViews FOR EACH ROW BEGIN ' +
'DECLARE mediaUserId INTEGER; DECLARE playlistUserId INTEGER; ' +
'SELECT b.userId, c.userId INTO playlistUserId, mediaUserId FROM playlistsPosts AS a ' +
'JOIN playlists AS b ON b.playlistId = a.playlistId JOIN posts AS c ON c.mediaId = a.mediaId ' +
'WHERE a.playlistId = NEW.playlistId AND a.mediaId = NEW.mediaId LIMIT 1;' +
'IF (NEW.viewerId != mediaUserId) THEN SET NEW.mediaUserId = mediaUserId; SET NEW.playlistUserId = playlistUserId; END IF; END;')

conn.query('CREATE TRIGGER after_playlistsViews_insert AFTER INSERT ON playlistsViews FOR EACH ROW BEGIN ' +
// 'UPDATE posts SET views = views + 1 WHERE mediaId=NEW.mediaId; END;')
'UPDATE posts SET views = (SELECT COUNT(*) FROM playlistsViews WHERE mediaId = NEW.mediaId) + (SELECT COUNT(*) FROM views WHERE mediaId = NEW.mediaId) WHERE mediaId=NEW.mediaId; END;')

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

conn.query('CREATE TRIGGER after_users_update AFTER UPDATE ON users FOR EACH ROW BEGIN ' +
'IF NEW.profileName <> OLD.profileName THEN ' +
'UPDATE posts SET profileName = NEW.profileName WHERE userId=NEW.userId; ' +
'UPDATE reposts SET profileName = NEW.profileName WHERE userId=NEW.userId; ' +
'UPDATE playlists SET profileName = NEW.profileName WHERE userId=NEW.userId; ' +
'UPDATE playlistsReposts SET profileName = NEW.profileName WHERE userId=NEW.userId; ' +
'END IF;' +
'IF NEW.profile_image_src <> OLD.profile_image_src THEN ' +
'UPDATE posts SET profile_image_src = NEW.profile_image_src WHERE userId=NEW.userId; ' +
'UPDATE reposts SET profile_image_src = NEW.profile_image_src WHERE userId=NEW.userId; ' +
'UPDATE playlists SET profile_image_src = NEW.profile_image_src WHERE userId=NEW.userId; ' +
'UPDATE playlistsReposts SET profile_image_src = NEW.profile_image_src WHERE userId=NEW.userId; ' +
'END IF; END;')

conn.query('CREATE TRIGGER after_playlistsPosts_insert AFTER INSERT ON playlistsPosts FOR EACH ROW BEGIN ' +
'DECLARE oldDisplayTime DATETIME; DECLARE playlistUserId INTEGER; SELECT displayTime, userId INTO oldDisplayTime, playlistUserId FROM playlists WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO playlistsPostsNotifications (senderId, receiverId, playlistId, mediaId, dateTime) VALUES (playlistUserId, (SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.playlistId, NEW.mediaId, NEW.dateTime); ' +
'IF (NEW.playlistIndex != 0 AND (oldDisplayTime IS NULL OR NEW.dateTime > oldDisplayTime)) THEN ' +
'UPDATE playlists SET displayTime = DATE_ADD(NEW.dateTime, INTERVAL 1 DAY), postsAdded = 1 WHERE playlistId=NEW.playlistId; ' +
'ELSE UPDATE playlists SET postsAdded = (postsAdded + 1) WHERE playlistId=NEW.playlistId; END IF; END;')

conn.query('CREATE TRIGGER after_playlistsPosts_delete AFTER DELETE ON playlistsPosts FOR EACH ROW BEGIN ' +
'DELETE FROM playlistsPostsNotifications WHERE playlistId = OLD.playlistId AND mediaId = OLD.mediaId; END;')

conn.query('CREATE PROCEDURE markNotificationsAsRead (IN notificationsUserId INTEGER) BEGIN ' +
'UPDATE postsNotifications SET unread = 0 WHERE receiverId = notificationsUserId;' +
'UPDATE playlistsNotifications SET unread = 0 WHERE receiverId = notificationsUserId; ' +
'UPDATE followingNotifications SET unread = 0 WHERE receiverId = notificationsUserId; ' +
'UPDATE playlistsPostsNotifications SET unread = 0 WHERE receiverId = notificationsUserId; END;')
*/

var usersToSockets = {}
var connectedUserIds = []
var pollingQuery = ''

io.on('connection', socket => {
  console.log("User connected");
  if (socket.request.user) {
    const userId = socket.request.user.userId;
    usersToSockets[userId] = socket
    connectedUserIds = []
    pollingQuery = ''

    for (var user in usersToSockets) {
      console.log("user is", user);
      connectedUserIds.push(user)
      pollingQuery += '?,'
    }

    pollingQuery = pollingQuery.slice(0, -1)
  }
  pollingLoop();


  socket.on('receive notifications', function() {
    console.log("receive notifications received");

 })

  socket.on('disconnect', () => {
    if (socket.request.user) {
      const userId = socket.request.user.userId
      console.log("deleted socket userId is", userId);
      delete usersToSockets[userId]

      connectedUserIds = []
      pollingQuery = ''
      for (var user in usersToSockets) {
        connectedUserIds.push(user)
        pollingQuery += '?,'
      }
      pollingQuery = pollingQuery.slice(0, -1)
    }
    console.log('user disconnected')
  })
})

function pollingLoop() {
  if (connectedUserIds.length > 0) {
    conn.query('SELECT receiverId, COUNT(*) > 0 AS unreadNotifications FROM (' +
    'SELECT a.receiverId FROM postsNotifications AS a WHERE a.receiverId IN (' + pollingQuery + ') AND a.unread=1 UNION ALL ' +
    'SELECT b.receiverId FROM playlistsNotifications AS b WHERE b.receiverId IN (' + pollingQuery + ') AND b.unread=1 UNION ALL ' +
    'SELECT c.receiverId FROM followingNotifications AS c WHERE c.receiverId IN (' + pollingQuery + ') AND c.unread=1 UNION ALL ' +
    'SELECT d.receiverId FROM playlistsPostsNotifications AS d WHERE d.receiverId IN (' + pollingQuery + ') AND d.unread=1) AS t GROUP BY receiverId', connectedUserIds.concat(connectedUserIds).concat(connectedUserIds).concat(connectedUserIds), function(err, result) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < result.length; i++) {
          if (usersToSockets[result[i].receiverId]) {
            usersToSockets[result[i].receiverId].emit('unread notifications', result[i].unreadNotifications)
          }
        }
        if (connectedUserIds.length > 0) {
          setTimeout(function() {pollingLoop()}, POLLING_INTERVAL);
        } else {
          console.log('The server timer was stopped because there are no more socket connections on the app')
        }
      }
    })
  }
}

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, uuidv1() + '.jpg')
    }
  }),
  limits: {fileSize: 10000000, files: 5},
  fileFilter: function(request, file, callback) {
     var ext = path.extname(file.originalname)
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

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/google/callback', passport.authenticate('google'), function(req, res) {
  const userId = req.user.userId
  const username = req.user.username
  res.cookie('userId', userId)
  res.cookie('username', username)
  res.redirect(process.env.WEBSITE_URL + '/' + username);
});

app.get('/auth/reddit', function(req, res, next) {
  req.session.state = crypto.randomBytes(32).toString('hex');
  passport.authenticate('reddit', { state: req.session.state})(req, res, next)});

app.get('/auth/reddit/callback',
  function(req, res, next) {
    if (req.query.state == req.session.state) {
      passport.authenticate('reddit')(req, res, next)
    } else {
      next(new Error(403))
    }
  }, function(req, res) {
    const userId = req.user.userId
    const username = req.user.username
    res.cookie('userId', userId)
    res.cookie('username', username)
    res.redirect(process.env.WEBSITE_URL + username);
});

app.get('/api/sessionLogin', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/sessionLogin');
  // res.send({message: "success"})
  const userId = req.user.userId
  conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=? LIMIT 1', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0]) {
        res.send(result[0]);
      } else {
        req.logout()
        req.session.destroy()
        res.clearCookie('username')
        res.clearCookie('userId')
        res.send({message: "not logged in"})
      }
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

app.get('/api/dropdownProfile/:username', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/dropdownProfile/' + req.params.username);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
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

app.get('/api/:username/followers/:orderBy', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.username + '/followers/' + req.params.orderBy);
  const orderBy = orderFollowers(req.params.orderBy)
  conn.query('SELECT a.username, a.profileName, a.profile_image_src FROM following INNER JOIN users AS a ON a.userId = following.followerUserId ' +
  'WHERE followingUserId = (SELECT userId FROM users WHERE username = :username LIMIT 1) ' + orderBy, {username: req.params.username}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/:username/following/:orderBy', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.username + '/following/' + req.params.orderBy);
  const orderBy = orderFollowers(req.params.orderBy)
  conn.query('SELECT a.username, a.profileName, a.profile_image_src FROM following INNER JOIN users AS a ON a.userId = following.followingUserId ' +
  'WHERE followerUserId = (SELECT userId FROM users WHERE username = :username LIMIT 1) ' + orderBy, {username: req.params.username}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/notificationsDropdown/:unread', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/notificationsDropdown/' + req.params.unread);
  var userId = req.user.userId
  var numUnreads = parseInt(req.params.unread, 10)
  if (isNaN(numUnreads)) {
    numUnreads = 5;
  }
  Promise.all([getNotifications(userId, numUnreads), markNotificationsAsRead(userId)])
  .then(function(allData) {
    res.send(allData[0])
  })
  .catch(e => {
    console.log(e);
  })
})

app.get('/api/postTags/:mediaId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postTags/' + req.params.mediaId);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const mediaId = req.params.mediaId

  conn.query('SELECT tagId, itemType, itemName, itemBrand, itemLink, original, x, y, imageIndex ' +
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const mediaId = req.params.mediaId

  conn.query('SELECT views, likes, reposts, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = :mediaId AND active = 1) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = :mediaId) > 0) AS liked ' +
  'FROM posts WHERE mediaId=:mediaId LIMIT 1', {userId: userId, mediaId: mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/playlistStats/:playlistId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistStats/' + req.params.playlistId);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const playlistId = req.params.playlistId

  conn.query('SELECT followers, likes, reposts, ' +
  '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:userId AND playlistId = :playlistId) > 0) AS followed, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:userId AND playlistId = :playlistId AND active = 1) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:userId AND playlistId = :playlistId) > 0) AS liked ' +
  'FROM playlists WHERE playlistId=:playlistId LIMIT 1', {userId: userId, playlistId: playlistId}, function(err, result) {
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
  conn.query('SELECT SUM(CASE WHEN dateTime BETWEEN :yesterday AND NOW() THEN 1 ELSE 0 END) AS dayViews, ' +
  'SUM(CASE WHEN dateTime BETWEEN :weekAgo AND NOW() THEN 1 ELSE 0 END) AS weekViews, ' +
  'COUNT(*) AS totalViews FROM views WHERE mediaUserId = :userId UNION ALL ' +
  'SELECT SUM(CASE WHEN dateTime BETWEEN :yesterday AND NOW() THEN 1 ELSE 0 END) AS dayViews, ' +
  'SUM(CASE WHEN dateTime BETWEEN :weekAgo AND NOW() THEN 1 ELSE 0 END) AS weekViews, ' +
  'COUNT(*) AS totalViews FROM playlistsViews WHERE mediaUserId = :userId',
  {yesterday: yesterday.toISOString(), weekAgo: weekAgo.toISOString(), userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({dayViews: result[0].dayViews + result[1].dayViews,
        weekViews: result[0].weekViews + result[1].weekViews,
        totalViews: result[0].totalViews + result[1].totalViews})
    }
  })
})

app.get('/api/postsStats/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postsStats/' + req.params.timePeriod);
  var userId = req.user.userId
  var timePeriod = getTimePeriod(req.params.timePeriod)

  conn.query('SELECT ' +
  '(SELECT COUNT(*) FROM likes WHERE mediaUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS likes, ' +
  '(SELECT COUNT(*) FROM reposts WHERE mediaUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW() AND active = 1) AS reposts, ' +
  '(SELECT COUNT(*) FROM comments WHERE mediaUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS comments',
  {userId: userId, timePeriod: timePeriod.toISOString()}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/postsViews/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postsViews/' + req.params.timePeriod);
  const userId = req.user.userId
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()

  conn.query('SELECT a.postsViews, a.repostsViews, b.collectionsViews, b.collectionsRepostsViews FROM (' +
  '(SELECT COUNT(*) AS postsViews, COUNT(reposterId) AS repostsViews FROM views WHERE mediaUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS a, ' +
  '(SELECT COUNT(*) AS collectionsViews, COUNT(reposterId) AS collectionsRepostsViews FROM playlistsViews WHERE mediaUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS b)',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/postsViewsGraph/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/postsViewsGraph/' + req.params.timePeriod);
  const userId = req.user.userId
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod)

  conn.query('SELECT DAYNAME(dateTime) AS day, COUNT(viewId) AS dayViews FROM views WHERE DATE(dateTime) > DATE_SUB(CURDATE(), INTERVAL 1 WEEK) ' +
  'AND receiverId = :userId GROUP BY day', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  })
})

app.get('/api/topPosts/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPosts/' + req.params.timePeriod);
  const userId = req.user.userId
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND a.dateTime BETWEEN :timePeriod AND NOW() '
  }

  conn.query('SELECT b.*, b.dateTime AS uploadDate, c.imageUrls, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId = :userId AND mediaId = b.mediaId) > 0) AS liked, ' +
  'false AS reposted, true AS isPoster, ' +
  'COUNT(*) AS timeViews FROM ' +
  '(SELECT viewId, mediaId, reposterId, viewerId, mediaUserId, dateTime FROM views UNION ALL SELECT viewId, mediaId, reposterId, viewerId, mediaUserId, dateTime FROM playlistsViews) a ' +
  'JOIN posts AS b ON b.mediaId = a.mediaId ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) c ON c.mediaId = b.mediaId ' +
  'WHERE a.mediaUserId = :userId ' + timePeriodQuery + 'GROUP BY a.mediaId ORDER BY timeViews DESC LIMIT 3',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
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

app.get('/api/topPostsViewers/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPostsViewers/' + req.params.timePeriod);
  const userId = req.user.userId
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND a.dateTime BETWEEN :timePeriod AND NOW() '
  }

  conn.query('SELECT b.username, b.profileName, b.profile_image_src, COUNT(*) AS timeViews FROM ' +
  '(SELECT viewId, mediaId, reposterId, viewerId, mediaUserId, dateTime FROM views UNION ALL SELECT viewId, mediaId, reposterId, viewerId, mediaUserId, dateTime FROM playlistsViews) a ' +
  'JOIN users AS b ON b.userId = a.viewerId ' +
  'WHERE a.mediaUserId = :userId ' + timePeriodQuery + 'GROUP BY a.viewerId ORDER BY timeViews DESC LIMIT 3',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/playlistsStats/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistsStats/' + req.params.timePeriod);
  var userId = req.user.userId
  var timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  var timePeriodQuery1 = ''
  if (timePeriod) {
    timePeriodQuery1 = 'b.dateTime BETWEEN :timePeriod AND :now AND '
  }

  conn.query('SELECT ' +
  '(SELECT COUNT(*) FROM playlistsLikes WHERE playlistUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS likes, ' +
  '(SELECT COUNT(*) FROM playlistsReposts WHERE playlistUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW() AND active = 1) AS reposts, ' +
  '(SELECT COUNT(*) FROM playlistsFollowers WHERE playlistUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS followers, ' +
  '(SELECT COUNT(*) FROM playlistsComments WHERE playlistUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()) AS comments',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/playlistsViews/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistsViews/' + req.params.timePeriod);
  const userId = req.user.userId
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()

  conn.query('SELECT COUNT(playlistId) AS collectionsViews, COUNT(reposterId) AS collectionsRepostsViews ' +
  'FROM playlistsViews WHERE playlistUserId = :userId AND dateTime BETWEEN :timePeriod AND NOW()',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result[0])
    }
  })
})

app.get('/api/topPlaylists/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPlaylists/' + req.params.timePeriod);
  const userId = req.user.userId
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND a.dateTime BETWEEN :timePeriod AND NOW() '
  }

  conn.query('SELECT b.*, b.dateTime AS uploadDate, c.posts, ' +
  '((SELECT COUNT(*) FROM playlistsLikes WHERE userId = :userId AND playlistId = b.playlistId) > 0) AS liked, ' +
  'false AS reposted, false AS followed, true AS isPoster, ' +
  'COUNT(*) AS timeViews FROM playlistsViews AS a ' +
  'JOIN playlists AS b ON b.playlistId = a.playlistId ' +
  'JOIN (SELECT a.playlistId, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', b.mediaId, \'url\', b.url, \'title\', b.title, \'views\', b.views, \'original\', b.original, \'username\', b.username, \'profileName\', b.profileName, \'playlistIndex\', a.playlistIndex, \'imageUrls\', c.imageUrls)) AS posts ' +
  'FROM playlistsPosts AS a ' +
  'JOIN posts AS b ON b.mediaId = a.mediaId ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) c ON c.mediaId = b.mediaId GROUP BY a.playlistId) c ON c.playlistId = b.playlistId ' +
  'WHERE a.playlistUserId = :userId ' + timePeriodQuery + 'GROUP BY a.playlistId ORDER BY timeViews DESC LIMIT 3',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        result[i].posts = JSON.parse(result[i].posts)
      }
      res.send(result)
    }
  })
})

app.get('/api/topPlaylistsViewers/:timePeriod', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/topPlaylistsViewers/' + req.params.timePeriod);
  var userId = req.user.userId
  var timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  var timePeriodQuery = ''
  if (timePeriod) {
    timePeriodQuery = 'AND a.dateTime BETWEEN :timePeriod AND NOW() '
  }

  conn.query('SELECT b.username, b.profileName, b.profile_image_src, COUNT(*) AS timeViews FROM playlistsViews AS a ' +
  'JOIN users AS b ON b.userId = a.viewerId ' +
  'WHERE a.playlistUserId = :userId ' + timePeriodQuery + 'GROUP BY a.viewerId ORDER BY timeViews DESC LIMIT 3',
  {userId: userId, timePeriod: timePeriod}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})
//
// app.get('/api/home', loggedIn, (req, res) => {
//   console.log('- Request received:', req.method.cyan, '/api/home');
//   Promise.all([getStream(req.user.userId, req.user.userId, false, false, false, false, false)])
//   .then(function(allData) {
//     res.send(allData[0])
//   }).catch(err => {
//     console.log(err);
//   })
// })

app.get('/api/home/:lastDate', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/home/' + req.params.lastDate);
  getStream(req.user.userId, req.user.userId, false, false, false, false, false, req.params.lastDate)
  .then(function(data) {
    res.send(data)
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/homeOriginal/:lastDate', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/homeOriginal/' + req.params.lastDate);
  getStream(req.user.userId, req.user.userId, false, true, false, false, false, req.params.lastDate)
  .then(function(data) {
    res.send(data)
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/explore/hot', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/hot');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  exploreHelper(0, userId).then(function(result) {
    res.send(result)
  }).catch(e => {
    console.log(e);
  })
})

app.get('/api/explore/collections/hot', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/collections/hot');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  exploreCollectionsHelper(0, userId).then(function(result) {
    res.send(result)
  }).catch(e => {
    console.log(e);
  })
})

app.get('/api/explore/new', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/new');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  exploreHelper(1, userId).then(function(result) {
    res.send(result)
  }).catch(e => {
    console.log(e);
  })
})

app.get('/api/explore/top/:timePeriod', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/explore/top/'  + req.params.timePeriod);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  if (timePeriod) {
    console.log("timePeriod is", timePeriod);
    exploreHelper(2, userId, timePeriod).then(function(result) {
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const now = new Date()
  const timePeriod = getTimePeriod(req.params.timePeriod).toISOString()
  if (timePeriod) {
    exploreHelper(3, userId, timePeriod).then(function(result) {
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  conn.query('SELECT *, a.images, b.username, b.profileName, b.profile_image_src, (posts.userId = :userId) AS isPoster, ' +
  '(LOG(10, GREATEST(1, posts.views/10 + posts.likes)) + UNIX_TIMESTAMP(posts.dateTime)/45000) AS hotScore, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId AND active = 1) > 0) AS reposted, ' +
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
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId AND active = 1) > 0) AS reposted, ' +
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
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId AND active = 1) > 0) AS reposted, ' +
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
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = posts.mediaId AND active = 1) > 0) AS reposted, ' +
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

app.get('/api/urlAvailable/:url', loggedIn, (req, res) => {
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

app.get('/api/urlAvailable/collection/:url', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/urlAvailable/' + req.params.url);
  const userId = req.user.userId
  conn.query('SELECT 1 FROM playlists WHERE userId=:userId AND url=:url', {userId: userId, url: req.params.url}, function(err, result) {
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT a.*, a.dateTime AS uploadDate, b.imageUrls, c.postTags, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId AND active = 1) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS liked, ' +
  '(:userId = a.userId) AS isPoster FROM posts AS a ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) b ON b.mediaId = a.mediaId ' +
  'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'x\', x, \'y\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) c ON c.mediaId = a.mediaId ' +
  'WHERE username = :username AND url = :url LIMIT 1', {userId: userId, username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0]) {
        if (result[0].imageUrls) {
          result[0].imageUrls = JSON.parse(result[0].imageUrls)
        }
        if (result[0].postTags) {
          result[0].postTags = JSON.parse(result[0].postTags)
        }
        res.send(result[0])
      } else {
        res.send({message: "error"})
      }
    }
  })
})

app.get('/api/relatedPosts/:username/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/relatedPosts/' + req.params.username + '/' + req.params.url);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT userId, dateTime AS uploadDate FROM posts WHERE username = :username AND url = :url LIMIT 1', {username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      const weekAgo = new Date(new Date(result[0].uploadDate) - (7 * 24 * 60 * 60 * 1000))
      conn.query('SELECT b.*, b.dateTime AS uploadDate, c.imageUrls, ' +
      '(LOG(10, GREATEST(1, b.views/10 + b.likes + b.comments)) + UNIX_TIMESTAMP(b.dateTime)/45000) AS hotScore, ' +
      '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = b.mediaId AND active = 1) > 0) AS reposted, ' +
      '(a.userId = :userId) AS liked, (:userId = b.userId) AS isPoster FROM likes AS a ' +
      'JOIN posts AS b ON b.mediaId = a.mediaId ' +
      'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) c ON c.mediaId = b.mediaId ' +
      'WHERE a.userId IN (SELECT followingUserId AS userId FROM following WHERE followerUserId = :postUserId UNION SELECT :postUserId AS userId) ' +
      'AND a.dateTime BETWEEN :weekAgo AND :postUploadDate GROUP BY a.mediaId, a.userId ORDER BY hotScore LIMIT 6',
      {userId: userId, postUserId: result[0].userId, weekAgo: weekAgo.toISOString(), postUploadDate: result[0].uploadDate}, function(err, relatedPosts) {
        if (err) {
          console.log(err);
        } else {
          for (var i = 0; i < relatedPosts.length; i++) {
            relatedPosts[i].imageUrls = JSON.parse(relatedPosts[i].imageUrls)
          }
          res.send(relatedPosts)
        }
      })
    }
  })
})

app.get('/api/:username/album/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/album/' + req.params.username + '/' + req.params.url);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT a.*, a.dateTime AS uploadDate, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', c.mediaId, \'username\', c.username, \'profileName\', c.profileName, \'profile_image_src\', c.profile_image_src, ' +
  '\'title\', c.title, \'url\', c.url, \'views\', c.views, \'original\', c.original, \'playlistIndex\', b.playlistIndex, \'imageUrls\', d.imageUrls)) AS posts, ' +
  '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS followed, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:userId AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS liked, ' +
  '(:userId = a.userId) AS isPoster FROM playlists AS a ' +
  'JOIN playlistsPosts AS b ON b.playlistId = a.playlistId ' +
  'JOIN posts AS c ON c.mediaId = b.mediaId ' +
  'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) d ON d.mediaId = c.mediaId ' +
  'WHERE a.username = :username AND a.url = :url GROUP BY a.playlistId LIMIT 1', {userId: userId, username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0]) {
        result[0].posts = JSON.parse(result[0].posts)
        res.send(result[0])
      } else {
        res.send({message: 'error'})
      }

    }
  })
})

app.get('/api/relatedCollections/:username/album/:url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/relatedCollections/' + req.params.username + '/' + req.params.url);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.username
  const url = req.params.url
  conn.query('SELECT userId, dateTime AS uploadDate FROM playlists WHERE username = :username AND url = :url LIMIT 1', {username: username, url: url}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      const weekAgo = new Date(new Date(result[0].uploadDate) - (7 * 24 * 60 * 60 * 1000))
      conn.query('SELECT b.*, b.dateTime AS uploadDate, ' +
      'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', d.mediaId, \'username\', d.username, \'profileName\', d.profileName, \'profile_image_src\', d.profile_image_src, ' +
      '\'title\', d.title, \'url\', d.url, \'views\', d.views, \'original\', d.original, \'imageUrls\', e.imageUrls)) AS posts, ' +
      '(LOG(10, GREATEST(1, b.followers + b.likes + b.comments)) + UNIX_TIMESTAMP(b.dateTime)/45000) AS hotScore, ' +
      '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:userId AND playlistId = b.playlistId) > 0) AS followed, ' +
      '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:userId AND playlistId = b.playlistId AND active = 1) > 0) AS reposted, ' +
      '(a.userId = :userId) AS liked, (:userId = b.userId) AS isPoster FROM playlistsLikes AS a ' +
      'JOIN playlists AS b ON b.playlistId = a.playlistId ' +
      'JOIN playlistsPosts AS c ON c.playlistId = b.playlistId ' +
      'JOIN posts AS d ON d.mediaId = c.mediaId ' +
      'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) e ON e.mediaId = d.mediaId ' +
      'WHERE a.userId IN (SELECT followingUserId AS userId FROM following WHERE followerUserId = :postUserId UNION SELECT :postUserId AS userId) ' +
      'AND a.dateTime BETWEEN :weekAgo AND :postUploadDate GROUP BY a.playlistId, a.userId ORDER BY hotScore LIMIT 6',
      {userId: userId, postUserId: result[0].userId, weekAgo: weekAgo.toISOString(), postUploadDate: result[0].uploadDate}, function(err, relatedCollections) {
        if (err) {
          console.log(err);
        } else {
          console.log(relatedCollections);
          for (var i = 0; i < relatedCollections.length; i++) {
            relatedCollections[i].posts = JSON.parse(relatedCollections[i].posts)
          }
          res.send(relatedCollections)
        }
      })
    }
  })
})

app.get('/api/getPlaylists', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/getPlaylists');
  var userId = req.user.userId;
  conn.query('SELECT a.playlistId, a.title, a.followers, a.public, COUNT(b.playlistPostId) AS numPosts, MAX(b.playlistIndex) AS biggestPlaylistIndex ' +
  'FROM playlists AS a LEFT JOIN playlistsPosts AS b ON b.playlistId = a.playlistId WHERE userId=? GROUP BY a.playlistId ORDER BY a.dateTime',
  [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send(result)
    }
  })
})

app.get('/api/playlistPost/:mediaId', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/playlistPost/' + req.params.mediaId);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var mediaId = req.params.mediaId
  conn.query('SELECT (SELECT COUNT(*) FROM views WHERE mediaId = a.mediaId) AS views, a.likes, a.reposts, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', b.imageUrl, \'width\', b.width, \'height\', b.height, \'imageIndex\', b.imageIndex)) AS imageUrls, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId AND active = 1) > 0) AS reposted, ' +
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
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
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
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

app.post('/api/collectionPostVisit', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/collectionPostVisit');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const view = req.body.view

  conn.query('INSERT IGNORE INTO playlistsViews (playlistId, mediaId, reposterId, viewerId, dateTime) VALUES ' +
  '(:playlistId, :mediaId, (SELECT userId FROM users WHERE username = :repost_username), :userId, :dateTime)',
  {playlistId: view.playlistId, mediaId: view.mediaId, repost_username: view.repost_username, userId: userId, dateTime: view.dateTime},
  function(err, result) {
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

app.post('/api/storeCollectionsViews', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/storeCollectionsViews');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const reqViews = req.body.views
  var question_query = ''
  var views = []

  for (var i = 0; i < reqViews.length; i++) {
    const currView = reqViews[i]
    views.push(currView.playlistId, currView.mediaId, currView.repost_username, userId, currView.dateTime)
    question_query += '(?,?,(SELECT userId FROM users WHERE username = ? LIMIT 1),?,?),'
  }
  question_query = question_query.slice(0, -1)

  conn.query('INSERT IGNORE INTO playlistsViews (playlistId, mediaId, reposterId, viewerId, dateTime) VALUES ' + question_query, views, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.affectedRows) {
        console.log("Recorded views successfully");
        res.send({message: "success"})
      } else {
        res.send({message: "same user"})
      }
    }
  })
})

app.post('/api/storePostsViews', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/storePostsViews');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const reqViews = req.body.views
  var question_query = ''
  var views = []

  for (var i = 0; i < reqViews.length; i++) {
    const currView = reqViews[i]
    views.push(currView.mediaId, currView.reposter, userId, currView.dateTime)
    question_query += '(?,(SELECT userId FROM users WHERE username = ? LIMIT 1),?,?),'
  }
  question_query = question_query.slice(0, -1)

  conn.query('INSERT IGNORE INTO views (mediaId, reposterId, viewerId, dateTime) VALUES ' + question_query, views, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.affectedRows) {
        console.log("Recorded views successfully");
        res.send({message: "success"})
      } else {
        res.send({message: "same user"})
      }
    }
  })
})

app.post('/api/newPlaylist', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/newPlaylist');
  const userId = req.user.userId
  const mediaId = req.body.mediaId
  const url = req.body.url
  const title = req.body.title
  const isPublic = req.body.isPublic
  const genre = req.body.genre
  const description = req.body.description

  conn.query('START TRANSACTION', [], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      conn.query('INSERT IGNORE INTO playlists (userId, title, url, genre, public, description) VALUES (?, ?, ?, ?, ?, ?)', [userId, title, url, genre, isPublic, description], function(err, result) {
        if (err) {
          console.log(err);
          conn.query('ROLLBACK', [], function(err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({message: 'fail'})
            }
          })
        } else {
          console.log(result.insertId);
          if (!result.insertId) {
            conn.query('ROLLBACK', [], function(err, result) {
              if (err) {
                console.log(err);
              } else {
                res.send({message: "Playlist url already exists"})
              }
            })
          }
          conn.query('INSERT IGNORE INTO playlistsPosts (playlistId, mediaId, playlistIndex) VALUES (?,?, 0)', [result.insertId, mediaId], function(err, result) {
            if (err) {
              console.log(err);
              conn.query('ROLLBACK', [], function(err, result) {
                if (err) {
                  console.log(err);
                } else {
                  res.send({message: 'fail'})
                }
              })
            } else {
              if (!result.insertId) {
                conn.query('ROLLBACK', [], function(err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.send({message: "Couldn't add post to playlist"})
                  }
                })
              } else {
                conn.query('COMMIT', [], function(err, result) {
                  if (err) {
                    conn.query('ROLLBACK', [], function(err, result) {
                      if (err) {
                        console.log(err);
                      } else {
                        res.send({message: "Couldn't add post to playlist"})
                      }
                    })
                  } else {
                    console.log("Transaction completed");
                    console.log("Created playlist successfully");
                    res.send({message: "success"})
                  }
                })
              }
            }
          })
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
  conn.query('INSERT INTO reposts (mediaId, userId) VALUES(:mediaId, :userId) ON DUPLICATE KEY UPDATE active = 1', {userId: req.user.userId, mediaId: req.body.mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.affectedRows) {
        res.send({message: "repost fail"})
      } else {
        console.log("reposted successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/unrepost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/unrepost');
  conn.query('UPDATE reposts SET active = 0 WHERE mediaId = :mediaId AND userId = :userId', {userId: req.user.userId, mediaId: req.body.mediaId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.affectedRows) {
        res.send({message: "repost fail"})
      } else {
        console.log("unreposted successfully");
        res.send({message: "success"})
      }
    }
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
  conn.query('INSERT INTO playlistsReposts (playlistId, userId) VALUES(:playlistId, :userId) ON DUPLICATE KEY UPDATE active = 1', {userId: req.user.userId, playlistId: req.body.playlistId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.affectedRows) {
        res.send({message: "repost fail"})
      } else {
        console.log("reposted successfully");
        res.send({message: "success"})
      }
    }
  })
})

app.post('/api/playlistUnrepost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistUnrepost');
  conn.query('UPDATE playlistsReposts SET active = 0 WHERE playlistId = :playlistId AND userId = :userId', {userId: req.user.userId, playlistId: req.body.playlistId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (!result.affectedRows) {
        res.send({message: "repost fail"})
      } else {
        console.log("unreposted successfully");
        res.send({message: "success"})
      }
    }
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

app.post('/api/addToPlaylist', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/addToPlaylist');
  console.log(req.body);
  conn.query('INSERT IGNORE INTO playlistsPosts (playlistId, mediaId, playlistIndex) VALUES ' +
  '(:playlistId, :mediaId, :playlistIndex)', req.body, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("result lastInsert Id is", result.insertId);
      if (!result.insertId) {
        res.send({message: "Already in playlist"})
      } else {
        res.send({message: "success"})
      }
    }
  })
})

app.delete('/api/deletePost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/deletePost');
  conn.query('DELETE FROM posts WHERE mediaId = :mediaId AND userId = :userId', {mediaId: req.body.mediaId, userId: req.user.userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted post successfully");
      res.send({message: "success"})
    }
  })
})

app.delete('/api/deleteCollection', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/deleteCollection');
  conn.query('DELETE FROM playlists WHERE playlistId = :playlistId AND userId = :userId', {playlistId: req.body.playlistId, userId: req.user.userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted collection successfully");
      res.send({message: "success"})
    }
  })
})

app.get('/api/you/likes/posts', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/likes/posts');
  var userId = req.user.userId;
  conn.query('SELECT b.*, b.dateTime AS uploadDate, c.imageUrls, a.dateTime AS likeTime, true AS liked, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId AND active = 1) > 0) AS reposted ' +
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

app.get('/api/you/likes/albums', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/likes/albums');
  const userId = req.user.userId;
  conn.query('SELECT b.*, b.dateTime AS uploadDate, a.dateTime AS likeTime, true AS liked, (b.userId = :userId) AS isPoster, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId = :userId AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
  '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId = :userId AND playlistId = a.playlistId) > 0) AS followed, ' +
  'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', d.mediaId, \'url\', d.url, \'title\', d.title, \'views\', d.views, \'original\', d.original, \'username\', d.username, \'profileName\', d.profileName, \'playlistIndex\', c.playlistIndex, \'imageUrls\', e.imageUrls)) AS posts ' +
  'FROM playlistsLikes AS a ' +
  'JOIN playlists AS b ON b.playlistId = a.playlistId ' +
  'LEFT JOIN playlistsPosts AS c ON c.playlistId = b.playlistId ' +
  'LEFT JOIN posts AS d ON d.mediaId = c.mediaId ' +
  'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) e ON e.mediaId = d.mediaId ' +
  'WHERE a.userId=:userId GROUP BY b.playlistId ORDER BY likeTime DESC LIMIT 24', {userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        result[i].posts = JSON.parse(result[i].posts)
      }
      res.send(result)
    }
  })
})

app.get('/api/:profile/info', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/info');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.profile
  conn.query('SELECT a.*, ' +
  '((SELECT COUNT(*) FROM following WHERE followingUserId = a.userId AND followerUserId = :userId) > 0) AS isFollowing, ' +
  '((SELECT COUNT(*) FROM following WHERE followingUserId = :userId AND followerUserId = a.userId) > 0) AS followsYou ' +
  'FROM users AS a WHERE a.username = :username LIMIT 1', {userId: userId, username: username}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      const row = result[0]
      if (row) {
        const isUser = (row.userId == userId)
        res.send({profile: row, isUser: isUser})
      } else {
        res.send({message: "error"})
      }

    }
  })
})

// app.get('/api/:profile/stream', (req, res) => {
//   console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/stream');
//   var userId = null;
//   if (req.user) {
//     userId = req.user.userId
//   }
//   const username = req.params.profile;
//   conn.query('SELECT userId FROM users WHERE username = ? LIMIT 1', [username], function(err, result) {
//     if (err) {
//       console.log(err);
//     } else {
//       if (result[0]) {
//         getStream(userId, result[0].userId, true, false, false, false, false)
//         .then(function(data) {
//           res.send(data)
//         }).catch(err => {
//           console.log(err);
//         })
//       } else {
//         res.send({message: "error"})
//       }
//     }
//   })
// })

app.get('/api/:profile/stream/:lastDate', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/stream/' + req.params.lastDate);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  const username = req.params.profile;
  conn.query('SELECT userId FROM users WHERE username = ? LIMIT 1', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result[0]) {
        getStream(userId, result[0].userId, true, false, false, false, false, req.params.lastDate)
        .then(function(data) {
          res.send(data)
        }).catch(err => {
          console.log(err);
        })
      } else {
        res.send({message: "error"})
      }
    }
  })
})

app.get('/api/:profile/userDetails', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/userDetails');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var username = req.params.profile;

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

app.get('/api/:profile/streamOriginal/:lastDate', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamOriginal');
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var username = req.params.profile;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      getStream(userId, result[0].userId, true, true, false, false, false)
      .then(function(allData) {
        res.send(allData)
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamPosts/:lastDate', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamPosts/' + req.params.lastDate);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var username = req.params.profile;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      getStream(userId, result[0].userId, true, false, true, false, false, req.params.lastDate)
      .then(function(allData) {
        res.send(allData)
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamPlaylists/:lastDate', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamPlaylists/' + req.params.lastDate);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var username = req.params.profile;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      getStream(userId, result[0].userId, true, false, false, true, false, req.params.lastDate)
      .then(function(allData) {
        res.send(allData)
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/streamReposts/:lastDate', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/streamReposts/' + req.params.lastDate);
  var userId = null;
  if (req.user) {
    userId = req.user.userId
  }
  var username = req.params.profile;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      getStream(userId, result[0].userId, true, false, false, false, true, req.params.lastDate)
      .then(function(allData) {
        res.send(allData)
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
  getPostComments(mediaId)
  .then(function(allData) {
    res.send({comments: allData[mediaId]})
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/:profile/:playlistId/playlistComments', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/' + req.params.playlistId + '/playlistComments');
  var username = req.params.profile;
  var playlistId = req.params.playlistId;
  getPlaylistsComments(playlistId)
  .then(function(allData) {
    res.send({comments: allData[playlistId]})
  }).catch(err => {
    console.log(err);
  })
})

app.post('/api/editProfileInfo', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/editProfileInfo');
  const userId = req.user.userId;
  var body = req.body
  body.userId = userId
  conn.query('UPDATE users SET username = :username, profileName = :profileName, location = :location, description = :description ' +
  'WHERE userId=:userId', body, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Edited profile successfully");
      res.cookie('username', body.username)
      res.send({message: 'success'})
    }
  })
})

app.post('/api/editPost', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/editPost');
  const userId = req.user.userId;
  var body = req.body
  body.userId = userId
  Promise.all([editPostMetadata(body), editPostTags(body), deletePostTags(body.deletedTags)])
  .then(function(allData) {
    console.log("Updated post successfully");
    res.send({message: "success"})
  })
  .catch(e => {
    console.log(e);
  })
})

app.post('/api/editCollection', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/editCollection');
  const userId = req.user.userId;
  var body = req.body
  body.userId = userId
  Promise.all([editCollectionMetadata(body), deleteCollectionPosts(body.deletedPosts), editCollectionPostsOrder(body)])
  .then(function(allData) {
    console.log("Updated collection successfully");
    res.send({message: "success"})
  })
  .catch(e => {
    console.log(e);
  })
})

app.post('/api/updateProfileImage', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/updateProfileImage');
  const userId = req.user.userId;
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      res.send({message: err.message})
    } else {
      const file = req.files[0]
      updateProfileImage(file, userId)
      .then(function(data) {
        console.log("updated profile image successfully");
        res.send(data)
      }).catch(e => {
        console.log(e);
      })
    }
  })
})

// app.post('/api/updateProfileImage', loggedIn, function(req, res) {
//   console.log('- Request received:', req.method.cyan, '/api/updateProfileImage');
//   const userId = req.user.userId;
//   upload(req, res, function(err) {
//     if (err) {
//       console.log(err);
//       res.send({message: err.message})
//     } else {
//       const file = req.files[0]
//       const filename = "/profileImages/" + file.fieldname + '-' + Date.now() +'.jpg'
//       if (file.mimetype == 'image/png') {
//         updateProfileImage(filename, file.buffer, userId)
//         .then(function(data) {
//           console.log("updated profile image successfully");
//           res.send(data)
//         }).catch(e => {
//           console.log(e);
//         })
//       } else {
//         jo.rotate(file.buffer, {}, function(error, buffer) {
//           if (error && error.code !== jo.errors.no_orientation && error.code !== jo.errors.correct_orientation) {
//             console.log('An error occurred when rotating the file: ' + error.message)
//             res.send({message: 'fail'})
//           } else {
//             updateProfileImage(filename, buffer, userId)
//             .then(function(data) {
//               console.log("updated profile image successfully");
//               res.send(data)
//             }).catch(e => {
//               console.log(e);
//             })
//           }
//         })
//       }
//     }
//   })
// })

app.post('/api/follow', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/follow');
  const username = req.body.username;
  const userId = req.user.userId;
  conn.query('SELECT userId FROM users WHERE username=?', [username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
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

app.post('/api/unfollow', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/unfollow');
  const username = req.body.username;
  const userId = req.user.userId;
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

app.post('/api/upload', loggedIn, function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/upload');
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      res.send({message: err.message})
    } else {
      uploadImageMetadata(req).then(function() {
        console.log("Records added successfully");
        res.send({message: 'success'})
      })
      .catch(e => {
        console.log(e);
        res.send({message: 'fail'})
      })
    }
  })
})

// app.post('/api/upload', loggedIn, function(req, res) {
//   console.log('- Request received:', req.method.cyan, '/api/upload');
//   upload(req, res, function(err) {
//     if (err) {
//       console.log(err);
//       res.send({message: err.message})
//     } else {
//       storeImages(req.files, req.body.dimensions).then(imageMetadata => {
//         conn.query('START TRANSACTION', [], function(err, result) {
//           if (err) {
//             console.log(err);
//           } else {
//             uploadImageMetadata(req, imageMetadata).then(function() {
//               conn.query('COMMIT', [], function(err, result) {
//                 if (err) {
//                   conn.query('ROLLBACK', [], function(err, result) {
//                     console.log(err);
//                   })
//                 } else {
//                   console.log("Records added successfully");
//                   console.log('Transaction Complete.');
//                   res.send({message: 'success'})
//                 }
//               })
//             })
//             .catch(e => {
//               console.log(e);
//               conn.query('ROLLBACK', [], function(err, result) {
//                 console.log(err);
//               })
//               res.send({message: 'fail'})
//             })
//           }
//         })
//       })
//       .catch(e => {
//         console.log(e);
//       })
//     }
//   })
// });

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
  const username = req.user.username
  // res.cookie('userId', req.user.userId)
  res.cookie('username', username)
  res.send({username: username, profileName: username, profile_image_src: null});
})

app.post('/api/signin', passport.authenticate('local-login'), function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/signin');
  // res.cookie('userId', req.user.userId)
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
  // res.clearCookie('userId');
  res.clearCookie('username');
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
    // res.clearCookie('userId');
    res.clearCookie('username');
    res.send({message: 'not logged in'})
  }
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

function postTagsFromUploadRevised(mediaId, inputTags) {
  return new Promise(function(resolve, reject) {
    const tags = JSON.parse(inputTags)
    if (tags.length > 0) {
      var question_query = ''
      var insertQuery = [];
      for (var i = 0; i < tags.length; i++) {
        const tag = tags[i]
        insertQuery.push(mediaId, tag.itemType, tag.itemName, tag.itemBrand, tag.itemLink.replace(/^https?\:\/\//i, ""), tag.original, tag.x, tag.y, tag.imageIndex);
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
    } else {
      return resolve({message: 'success'})
    }
  })
}

function insertPostImages(mediaId, req) {
  return new Promise(function(resolve, reject) {
    const dimensions = JSON.parse(req.body.dimensions)
    const files = req.files
    var question_query = ''
    var insertQuery = [];
    for (var i = 0; i < files.length; i++) {
      const file = files[i]
      insertQuery.push(mediaId, file.location, dimensions[i].width, dimensions[i].height, i);
      question_query += '(?, ?, ?, ?, ?),';
    }
    question_query = question_query.slice(0, -1);
    conn.query('INSERT INTO postsImages (mediaId, imageUrl, width, height, imageIndex) VALUES ' + question_query, insertQuery, function(err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve({message: 'success'})
      }
    })
  });
}

function getStream(cookieUser, userId, isProfile, original, posts, playlists, reposts, lastDate) {
  return new Promise(function(resolve, reject) {
    var profileToggle1 = ''
    var profileToggle2 = ''

    var userPlaylistsFollowing = ''

    var lastDateToggle1 = ''
    var lastDateToggle2 = ''
    var lastDateToggle3 = ''

    if (lastDate) {
      lastDateToggle1 = 'AND UNIX_TIMESTAMP(a.displayTime) < ' + lastDate + ' '
      lastDateToggle2 = 'AND UNIX_TIMESTAMP(a.dateTime) < ' + lastDate + ' '
      lastDateToggle3 = 'AND UNIX_TIMESTAMP(b.dateTime) < ' + lastDate + ' '
    }

    if (!isProfile) {
      profileToggle1 = 'b.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      profileToggle2 = 'a.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      // profileToggle3 = 'reposts.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
      // profileToggle4 = 'posts.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '

      userPlaylistsFollowing = 'SELECT null AS mediaId, a.playlistId, a.title, a.url, a.genre, a.public, null AS original, null AS imageUrls, ' +
      'null AS views, a.likes, a.reposts, a.comments, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, a.displayTime AS orderTime, a.displayTime, a.postsAdded, ' +
      'null AS repost_username, null AS repost_profileName, null AS repost_profile_image_src, a.username, a.profileName, a.profile_image_src, null AS postTags, ' +
      'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', d.mediaId, \'title\', d.title, \'original\', d.original, \'views\', d.views, \'username\', d.username, \'profileName\', d.profileName, \'url\', d.url, \'imageUrls\', e.imageUrls, \'playlistIndex\', c.playlistIndex)) AS playlistPosts, ' +
      '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
      '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ' +
      '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
      '(a.userId = :cookieUser) AS isPoster FROM playlistsFollowers AS b ' +
      'INNER JOIN playlists AS a ON a.playlistId = b.playlistId AND a.displayTime < CURRENT_TIMESTAMP ' +
      'LEFT JOIN playlistsPosts AS c ON c.playlistId = a.playlistId AND c.dateTime < a.displayTime ' +
      'LEFT JOIN posts AS d ON d.mediaId = c.mediaId ' +
      'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) e ON e.mediaId = d.mediaId ' +
      'WHERE ' + profileToggle1 + 'b.userId=:userId ' + lastDateToggle1 + 'GROUP BY b.playlistId UNION ALL '
    }

    var originalToggle1 = ''
    var originalToggle2 = ''
    if (original) {
      originalToggle1 = 'AND b.original = 1 '
      originalToggle2 = 'AND a.original = 1 '
    }

    var userPlaylistReposts = 'SELECT null as mediaId, a.playlistId, a.title, a.url, a.genre, a.public, null as original, null as imageUrls, ' +
    'null AS views, a.likes, a.reposts, a.comments, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, b.dateTime as orderTime, null AS displayTime, null AS postsAdded, ' +
    'b.username AS repost_username, b.profileName AS repost_profileName, b.profile_image_src AS repost_profile_image_src, a.username, a.profileName, a.profile_image_src, null AS postTags, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', f.mediaId, \'title\', f.title, \'original\',f.original, \'views\', f.views, \'username\', f.username, \'profileName\', f.profileName, \'url\', f.url, \'imageUrls\', postsImages.imageUrls, \'playlistIndex\', e.playlistIndex)) AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ' +
    '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster FROM playlistsReposts AS b ' +
    'INNER JOIN playlists AS a ON a.playlistId = b.playlistId ' +
    'LEFT JOIN playlistsPosts AS e ON e.playlistId = b.playlistId ' +
    'LEFT JOIN posts AS f ON f.mediaId = e.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) postsImages ON postsImages.mediaId = f.mediaId ' +
    'WHERE ' + profileToggle1 + 'b.userId=:userId AND b.active = 1 ' + lastDateToggle3 + 'GROUP BY b.repostId'

    var userPlaylistPosts = 'SELECT null as mediaId, a.playlistId, a.title, a.url, a.genre, a.public, null as original, null as imageUrls, ' +
    'null AS views, a.likes, a.reposts, a.comments, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, a.dateTime as orderTime, null AS displayTime, null AS postsAdded, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, a.username, a.profileName, a.profile_image_src, null AS postTags, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', c.mediaId, \'title\', c.title, \'original\', c.original, \'views\', c.views, \'username\', c.username, \'profileName\', c.profileName, \'url\', c.url, \'imageUrls\', d.imageUrls, \'playlistIndex\', b.playlistIndex)) AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ' +
    '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster FROM playlists AS a ' +
    'LEFT JOIN playlistsPosts AS b ON b.playlistId = a.playlistId ' +
    'LEFT JOIN posts AS c ON c.mediaId = b.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) d ON d.mediaId = c.mediaId ' +
    'WHERE ' + profileToggle2 + 'a.userId=:userId ' + lastDateToggle2 + 'GROUP BY a.playlistId'

    var userReposts = 'SELECT b.mediaId, null as playlistId, b.title, b.url, b.genre, null, b.original, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', e.imageUrl, \'width\', e.width, \'height\', e.height, \'imageIndex\', e.imageIndex)) AS imageUrls, b.views, ' +
    'b.likes, b.reposts, b.comments, null as playlistFollowers, b.description, b.dateTime AS uploadDate, a.dateTime as orderTime, null AS displayTime, null AS postsAdded, ' +
    'a.username as repost_username, a.profileName as repost_profileName, a.profile_image_src AS repost_profile_image_src, ' +
    'b.username, b.profileName, b.profile_image_src, d.postTags AS postTags, null AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:cookieUser AND mediaId = b.mediaId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = b.mediaId) > 0) AS liked, ' +
    'null AS followed, ' +
    '(b.userId = :cookieUser) AS isPoster FROM reposts AS a ' +
    'INNER JOIN posts AS b ON b.mediaId = a.mediaId ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'x\', x, \'y\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) d ON d.mediaId = a.mediaId ' +
    'INNER JOIN postsImages AS e ON e.mediaId = a.mediaId ' +
    'WHERE (' + profileToggle2 + 'a.userId=:userId) AND a.active = 1 ' + lastDateToggle2 + originalToggle1 + 'GROUP BY a.repostId'

    var userPosts = 'SELECT a.mediaId, null as playlistId, a.title, a.url, a.genre, null, a.original, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', e.imageUrl, \'width\', e.width, \'height\', e.height, \'imageIndex\', e.imageIndex)) AS imageUrls, a.views, a.likes, a.reposts, a.comments, ' +
    'null as playlistFollowers, a.description, a.dateTime AS uploadDate, a.dateTime as orderTime, null AS displayTime, null AS postsAdded, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, ' +
    'a.username, a.profileName, a.profile_image_src, tags.postTags AS postTags, null AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:cookieUser AND mediaId = a.mediaId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = a.mediaId) > 0) AS liked, ' +
    'null AS followed, (a.userId = :cookieUser) AS isPoster FROM posts AS a ' +
    'LEFT JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'itemType\', itemType, \'itemName\', itemName, \'itemBrand\', itemBrand, \'itemLink\', itemLink, \'original\', original, \'x\', x, \'y\', y, \'imageIndex\', imageIndex)) AS postTags FROM tags GROUP BY mediaId) tags ON tags.mediaId = a.mediaId ' +
    'LEFT JOIN postsImages AS e ON e.mediaId = a.mediaId ' +
    'WHERE (' + profileToggle2 + 'a.userId=:userId) ' + lastDateToggle2 + originalToggle2 + ' GROUP BY a.mediaId'

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
      queryString = userPlaylistsFollowing + userPlaylistReposts + ' UNION ALL ' + userPlaylistPosts + ' UNION ALL ' + userReposts + ' UNION ALL ' + userPosts + orderBy
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
              description:row.description, uploadDate:row.uploadDate,
              displayTime:row.displayTime, postsAdded:row.postsAdded, public: row.public,
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
    conn.query('INSERT IGNORE INTO ' + table + ' (' + idType  + ', userId) VALUES (?,?)',
    [id, userId], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        if (!result.insertId) {
          return resolve({message: "Already liked"})
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
    conn.query('DELETE FROM ' + table + ' WHERE ' + idType + '=? AND userId=?', [id, userId], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        if (!result.affectedRows) {
          return resolve({message: "Already liked"})
        } else {
          console.log('un' + table + "ed post successfully");
          return resolve({message: "success"})
        }
      }
    })
  })
}

function uploadImageMetadata(req) {
  return new Promise(function(resolve, reject) {
    var insertQuery = [req.user.userId, req.body.title, req.body.url, req.body.genre.toLowerCase(), req.body.original, req.body.description];
    conn.query('INSERT INTO posts (userId, title, url, genre, original, description) VALUES (?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
      if (err) {
        console.log("upload error");
        return reject(err);
      } else {
        Promise.all([postTagsFromUploadRevised(result.insertId, req.body.inputTags), insertPostImages(result.insertId, req)])
        .then(function() {
          return resolve({message: 'success'})
        }).catch(e => {
          return reject(e);
        })
      }
    })
  });
}

// function uploadImageMetadata(req, imageMetadata) {
//   return new Promise(function(resolve, reject) {
//     var insertQuery = [req.user.userId, req.body.title, req.body.url, req.body.genre.toLowerCase(), req.body.original, req.body.description];
//     conn.query('INSERT INTO posts (userId, title, url, genre, original, description) VALUES (?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
//       if (err) {
//         console.log("upload error");
//         return reject(err);
//       } else {
//         if (JSON.parse(req.body.inputTags).length > 0) {
//           Promise.all([postTagsFromUploadRevised(result.insertId, JSON.parse(req.body.inputTags)), insertPostImages(result.insertId, imageMetadata, JSON.parse(req.body.dimensions))])
//           .then(function() {
//             return resolve({message: 'success'})
//           }).catch(e => {
//             return reject(e);
//           })
//         } else {
//           insertPostImages(result.insertId, imageMetadata, JSON.parse(req.body.dimensions)).then(function() {
//             return resolve({message: 'success'})
//           }).catch(e => {
//             return reject(e);
//           })
//         }
//       }
//     })
//   });
// }

function updateProfileImage(file, userId) {
  return new Promise(function(resolve, reject) {
    conn.query('UPDATE users SET profile_image_src = ? WHERE userId=?', [file.location, userId], function(err, result) {
      if (err) {
        return reject(err)
      } else {
        return resolve({profile_image_src: file.location})
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

async function storeImages(files, dimensions) {
  var imageMetadata = []
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var dimension = dimensions[i]
    var filename = "/images/" + uuidv1() + '.jpg'
    var metadata = await storeImagesHelper(file, dimension, filename, i)
    imageMetadata.push(metadata)
  }
  return imageMetadata
}

function storeImagesHelper(file, dimensions, filename, index) {
  return new Promise(function(resolve, reject) {
    // var dimensions = sizeOf(file.buffer);
    if (file.mimetype == 'image/png') {
      fs.writeFile("public" + filename, file.buffer, function(err) {
        if (err) {
          return reject(err);
        } else {
          return resolve({filename: filename, order: index})
          // return resolve({filename: filename, height: dimensions.height, width: dimensions.width, order: index})
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
              return resolve({filename: filename, order: index})
              // return resolve({filename: filename, height: dimensions.height, width: dimensions.width, order: index})
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
        hotScore = '(LOG(10, GREATEST(1, a.views/10 + a.likes)) + UNIX_TIMESTAMP(a.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
        break;
      //new
      case 1:
        orderBy = 'ORDER BY a.dateTime '
        break;
      //top
      case 2:
        orderBy = 'ORDER BY a.views '
        break;
      //random
      case 3:
        orderBy = 'ORDER BY a.views '
        break;
      default:
        hotScore = '(LOG(10, GREATEST(1, a.views/10 + a.likes)) + UNIX_TIMESTAMP(a.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
    }

    var timePeriodQuery = ''
    if (timePeriod) {
      timePeriodQuery = 'WHERE a.dateTime BETWEEN :timePeriod AND NOW() '
    }

    conn.query('SELECT a.*, a.dateTime AS uploadDate, b.imageUrls, (a.userId = :userId) AS isPoster, ' + hotScore +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:userId AND mediaId = a.mediaId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM likes WHERE userId=:userId AND mediaId = a.mediaId) > 0) AS liked FROM posts AS a ' +
    'INNER JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) b ON b.mediaId = a.mediaId ' +
    timePeriodQuery + 'GROUP BY mediaId ' + orderBy + 'DESC LIMIT 24', {userId: userId, timePeriod: timePeriod}, function(err, result) {
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

function exploreCollectionsHelper(type, userId, timePeriod) {
  return new Promise(function(resolve, reject) {
    var hotScore = ''
    var orderBy = ''
    switch (type) {
      //hot
      case 0:
        hotScore = '(LOG(10, GREATEST(1, a.likes + a.followers)) + UNIX_TIMESTAMP(a.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
        break;
      //new
      case 1:
        orderBy = 'ORDER BY a.dateTime '
        break;
      //top
      case 2:
        orderBy = 'ORDER BY a.likes + a.followers '
        break;
      //random
      case 3:
        orderBy = 'ORDER BY a.likes + a.followers '
        break;
      default:
        hotScore = '(LOG(10, GREATEST(1, a.likes + a.followers)) + UNIX_TIMESTAMP(a.dateTime)/45000) AS hotScore, '
        orderBy = 'ORDER BY hotScore '
    }

    var timePeriodQuery = ''
    if (timePeriod) {
      timePeriodQuery = 'WHERE a.dateTime BETWEEN :timePeriod AND NOW() '
    }

    conn.query('SELECT a.*, a.dateTime AS uploadDate, b.posts, (a.userId = :userId) AS isPoster, ' + hotScore +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:userId AND playlistId = a.playlistId AND active = 1) > 0) AS reposted, ' +
    '((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS liked, ' +
    '((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:userId AND playlistId = a.playlistId) > 0) AS followed ' +
    'FROM playlists AS a ' +
    'JOIN (SELECT a.playlistId, ' +
    'JSON_ARRAYAGG(JSON_OBJECT(\'mediaId\', b.mediaId, \'url\', b.url, \'title\', b.title, \'views\', b.views, \'original\', b.original, \'username\', b.username, \'profileName\', b.profileName, \'playlistIndex\', a.playlistIndex, \'imageUrls\', c.imageUrls)) AS posts ' +
    'FROM playlistsPosts AS a ' +
    'JOIN posts AS b ON b.mediaId = a.mediaId ' +
    'JOIN (SELECT mediaId, JSON_ARRAYAGG(JSON_OBJECT(\'imageUrl\', imageUrl, \'width\', width, \'height\', height, \'imageIndex\', imageIndex)) AS imageUrls FROM postsImages GROUP BY mediaId) c ON c.mediaId = b.mediaId GROUP BY a.playlistId) b ON b.playlistId = a.playlistId ' +
    timePeriodQuery + 'GROUP BY playlistId ' + orderBy + 'DESC LIMIT 3', {userId: userId, timePeriod: timePeriod}, function(err, result) {
      if (err) {
        console.log(err);
        return reject(err)
      } else {
        for (var i = 0; i < result.length; i++) {
          if (result[i].posts) {
            result[i].posts = JSON.parse(result[i].posts)
          }
        }
        return resolve(result)
      }
    })
  })
}

function editPostMetadata(body) {
  return new Promise(function(resolve, reject) {
    conn.query('UPDATE posts SET title = :title, url = :url, genre = :genre, description = :description, original = :original WHERE userId = :userId AND mediaId = :mediaId', body, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        return resolve({message: "success"})
      }
    })
  })
}

function editPostTags(body) {
  return new Promise(function(resolve, reject) {
    if (body.tags.length > 0) {
      var insertTags = []
      var insertTagQuery = ''
      for (var i = 0; i < body.tags.length; i++) {
        const tag = body.tags[i]
        insertTags.push(tag.tagId, body.mediaId, tag.itemType, tag.itemBrand, tag.itemName, tag.itemLink, tag.original, tag.imageIndex, tag.x, tag.y)
        insertTagQuery += '(?,?,?,?,?,?,?,?,?,?),'
      }
      insertTagQuery = insertTagQuery.slice(0, -1)
      conn.query('INSERT INTO tags (tagId, mediaId, itemType, itemBrand, itemName, itemLink, original, imageIndex, x, y) VALUES ' +
      insertTagQuery + ' ON DUPLICATE KEY UPDATE ' +
      'itemType=VALUES(itemType),itemBrand=VALUES(itemBrand),itemName=VALUES(itemName),itemLink=VALUES(itemLink),original=VALUES(original),imageIndex=VALUES(imageIndex),x=VALUES(x),y=VALUES(y)', insertTags, function(err, result) {
        if (err) {
          return reject(err)
        } else {
          return resolve({message: "success"})
        }
      })
    } else {
      return resolve({message: "success"})
    }
  })
}

function deletePostTags(deletedTags) {
  return new Promise(function(resolve, reject) {
    if (deletedTags.length > 0) {
      var deletedQuery = ''
      var deletedTagIds = []
      for (var i = 0; i < deletedTags.length; i++) {
        deletedTagIds.push(deletedTags[i].tagId)
        deletedQuery += '(?),'
      }
      deletedQuery = deletedQuery.slice(0, -1)
      conn.query('DELETE FROM tags WHERE (tagId) IN (' + deletedQuery + ')', deletedTagIds, function(err, result) {
        if (err) {
          return reject(err)
        } else {
          return resolve({message: "success"})
        }
      })
    } else {
      return resolve({message: "success"})
    }
  })
}

function editCollectionMetadata(body) {
  return new Promise(function(resolve, reject) {
    conn.query('UPDATE playlists SET title = :title, url = :url, genre = :genre, description = :description WHERE userId = :userId AND playlistId = :playlistId', body, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        return resolve({message: "success"})
      }
    })
  })
}

function editCollectionPostsOrder(body) {
  return new Promise(function(resolve, reject) {
    const posts = body.posts
    const playlistId = body.playlistId
    if (posts.length > 0) {
      var insertPosts = []
      var insertPostQuery = ''
      for (var i = 0; i < posts.length; i++) {
        const post = posts[i]
        insertPosts.push(playlistId, post.mediaId, post.playlistIndex)
        insertPostQuery += '(?,?,?),'
      }
      insertPostQuery = insertPostQuery.slice(0, -1)
      conn.query('INSERT INTO playlistsPosts (playlistId, mediaId, playlistIndex) VALUES ' +
      insertPostQuery + ' ON DUPLICATE KEY UPDATE playlistIndex = VALUES(playlistIndex)', insertPosts, function(err, result) {
        if (err) {
          return reject(err)
        } else {
          return resolve({message: "success"})
        }
      })
    } else {
      return resolve({message: "success"})
    }
  })
}

function deleteCollectionPosts(deletedPosts) {
  return new Promise(function(resolve, reject) {
    if (deletedPosts.length > 0) {
      var deletePostQuery = ''
      for (var i = 0; i < deletedPosts.length; i++) {
        deletePostQuery += '(?),'
      }
      deletePostQuery = deletePostQuery.slice(0, -1)
      conn.query('DELETE FROM playlistsPosts WHERE (mediaId) IN (' + deletePostQuery + ')', deletedPosts, function(err, result) {
        if (err) {
          return reject(err)
        } else {
          return resolve({message: "success"})
        }
      })
    } else {
      return resolve({message: "success"})
    }
  })
}

function markNotificationsAsRead(userId) {
  return new Promise(function(resolve, reject) {
    conn.query('CALL markNotificationsAsRead(:userId)', {userId: userId}, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        return resolve({message: "success"})
      }
    })
  })
}

function getNotifications(userId, numUnreads) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT ' +
    'b.username, b.profileName, b.profile_image_src, ' +
    'a.activity, a.comment, null AS isFollowing, ' +
    'c.mediaId, c.url AS postUrl, JSON_OBJECT(\'imageUrl\', d.imageUrl, \'width\', d.width, \'height\', d.height) AS image, c.username AS postUsername, ' +
    'null AS playlistId, null AS playlistUrl, null AS title, null AS playlistUsermame, ' +
    'a.dateTime ' +
    'FROM postsNotifications AS a ' +
    'INNER JOIN users AS b ON b.userId = a.senderId INNER JOIN posts AS c ON c.mediaId = a.mediaId ' +
    'INNER JOIN postsImages AS d ON d.mediaId = a.mediaId AND d.imageIndex = 0 ' +
    'WHERE receiverId=:userId ' +
    'UNION ALL ' +
    'SELECT b.username, b.profileName, b.profile_image_src, ' +
    'a.activity, a.comment, null AS isFollowing, ' +
    'null AS mediaId, null AS postUrl, null AS image, null AS postUsername, ' +
    'c.playlistId, c.url AS playlistUrl, c.title, c.username AS playlistUsermame, ' +
    'a.dateTime ' +
    'FROM playlistsNotifications AS a ' +
    'INNER JOIN users AS b ON b.userId = a.senderId INNER JOIN playlists AS c ON c.playlistId = a.playlistId ' +
    'WHERE receiverId=:userId ' +
    'UNION ALL ' +
    'SELECT b.username, b.profileName, b.profile_image_src, ' +
    'null AS activity, null AS comment, (SELECT COUNT(*) FROM following WHERE followerUserId=:userId AND followingUserId = b.userId) > 0 AS isFollowing, ' +
    'null AS mediaId, null AS postUrl, null AS image, null AS postUsername, ' +
    'null AS playlistId, null AS playlistUrl, null AS title, null AS playlistUsermame, ' +
    'a.dateTime ' +
    'FROM followingNotifications AS a ' +
    'INNER JOIN users AS b ON b.userId = a.senderId ' +
    'WHERE receiverId=:userId ' +
    'UNION ALL ' +
    'SELECT b.username, b.profileName, b.profile_image_src, ' +
    'null AS activity, null AS comment, null AS isFollowing, ' +
    'c.mediaId, c.url AS postUrl, JSON_OBJECT(\'imageUrl\', d.imageUrl, \'width\', d.width, \'height\', d.height) AS image, c.username AS postUsername, ' +
    'e.playlistId, e.url AS playlistUrl, e.title, e.username AS playlistUsermame, ' +
    'a.dateTime ' +
    'FROM playlistsPostsNotifications AS a ' +
    'INNER JOIN users AS b ON b.userId = a.senderId INNER JOIN posts AS c ON c.mediaId = a.mediaId ' +
    'INNER JOIN postsImages AS d ON d.mediaId = a.mediaId AND d.imageIndex = 0 ' +
    'INNER JOIN playlists AS e ON e.playlistId = a.playlistId ' +
    'WHERE receiverId = :userId ' +
    'ORDER BY dateTime DESC LIMIT :numUnreads', {userId: userId, numUnreads: numUnreads}, function(err, result) {
      if (err) {
        return reject(err);
      } else {
        var notifications = []
        for (var i = 0; i < result.length; i++) {
          var row = result[i]
          if (row.mediaId && row.playlistId) {
            if (row.image) {
              row.image = JSON.parse(row.image)
            }
            notifications.push({playlistPost: row})
          } else if (row.mediaId) {
            notifications.push({post: row})
            if (row.image) {
              row.image = JSON.parse(row.image)
            }
          } else if (row.playlistId){
            notifications.push({playlist: row})
          } else {
            notifications.push({follow: row})
          }
        }
        return resolve({notifications: notifications})
      }
    })
  })
}
