// use strict compiling
"use strict";
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
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
var cors = require('cors')
var socketIO = require('socket.io')

var client  = Redis.createClient();
var app = express();

var server = http.createServer(app)

var io = socketIO(server)

io.on('connection', socket => {
  console.log('User connected')

  socket.on('receive notifications', function(userId) {

    socketId = getSocketIdFromUserId(user_id);
    io.to(socketId).emit('notification', 'test data');
 })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.use(cors({credentials: true, origin: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    client: client
  }),
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

passport.serializeUser(function(userId, done) {
  console.log("serializeUser userId is", userId);
	done(null, userId);
})

passport.deserializeUser(function(userId, done) {
  console.log("deserializing user");
  done(null, userId);
})

passport.use('local-login', new LocalStrategy(
 function(username, password, done) {
   conn.query('SELECT * FROM logins WHERE username=?', [username], function(err, result) {
     console.log(result);
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
        return done(null, result[0].userId)
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
         return done(null, result[0].userId)
       }
       var username = profile.displayName.replace(/\s+/g, '');
       Promise.all([generateUsername(username)])
       .then(function(allData) {
         console.log(allData[0]);
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
             return done(null, userId)
           })
         })
       })
     })
   }
))

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
  limits: {fileSize: 10000000, files: 1},
  fileFilter: function(request, file, callback) {
     var ext = path.extname(file.originalname)
     console.log("ext is", ext);
     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.JPG') {
          return callback(new Error('Only images are allowed'), false);
      }
      callback(null, true)
  }
}).single('image');

var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: 'yushufstartup',
        pass: 'fashionsoundcloud'
    }
})
// serve static files
// app.use(express.static('dist'));

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
conn.query('DROP TABLE IF EXISTS notifications')
conn.query('DROP TABLE IF EXISTS following');
conn.query('DROP TABLE IF EXISTS logins')
conn.query('SET foreign_key_checks = 1')

conn.query('CREATE TABLE IF NOT EXISTS users (userId INTEGER AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, profileName TEXT, profile_image_src VARCHAR(255), ' +
'location TEXT, followers INTEGER DEFAULT 0, following INTEGER DEFAULT 0, description TEXT, createdDate DATETIME DEFAULT CURRENT_TIMESTAMP)')

conn.query('CREATE TABLE IF NOT EXISTS logins (loginId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, network TEXT, networkId TEXT, accessToken TEXT, username VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) UNIQUE, passwordText TEXT, passwordSalt TEXT, ' +
'passwordHash CHAR(60), verificationHash CHAR(60), verified BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY (userId) REFERENCES users(userId));')

conn.query('CREATE TABLE IF NOT EXISTS posts (mediaId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, title VARCHAR(255) NOT NULL, genre TEXT, imageUrl VARCHAR(255) NOT NULL UNIQUE, original BOOLEAN, ' +
'views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(userId));')

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER AUTO_INCREMENT PRIMARY KEY, userId INTEGER NOT NULL, title VARCHAR(255), genre TEXT, public BOOLEAN, likes INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, ' +
'followers INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, description TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(title, userId))')

conn.query('CREATE TABLE IF NOT EXISTS notifications (notificationId INTEGER AUTO_INCREMENT PRIMARY KEY, unread BOOLEAN NOT NULL DEFAULT TRUE, userId INTEGER, mediaId INTEGER, playlistId INTEGER, activity TEXT, comment TEXT, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId), FOREIGN KEY (playlistId) REFERENCES playlists(playlistId))')

conn.query('CREATE TABLE IF NOT EXISTS tags (tagId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER, itemType TEXT, itemName TEXT, itemBrand TEXT, original BOOLEAN, x INTEGER, y INTEGER, FOREIGN KEY (mediaId) REFERENCES posts(mediaId))');

conn.query('CREATE TABLE IF NOT EXISTS reposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS likes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(mediaId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS views (mediaId INTEGER, userId INTEGER, IP_Address TEXT, viewCount INTEGER, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP)');

conn.query('CREATE TABLE IF NOT EXISTS comments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, mediaId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mediaId) REFERENCES posts(mediaId), FOREIGN KEY (userId) REFERENCES users(userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistPostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, mediaId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (mediaId) REFERENCES posts(mediaId), UNIQUE(playlistId, mediaId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistFollowId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsReposts (repostId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsLikes (likeId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId), UNIQUE(playlistId, userId))');

conn.query('CREATE TABLE IF NOT EXISTS playlistsComments (commentId INTEGER AUTO_INCREMENT PRIMARY KEY, playlistId INTEGER NOT NULL, userId INTEGER NOT NULL, comment TEXT NOT NULL, dateTime DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (playlistId) REFERENCES playlists(playlistId), FOREIGN KEY (userId) REFERENCES users(userId))')

conn.query('CREATE TABLE IF NOT EXISTS following (followingId INTEGER AUTO_INCREMENT PRIMARY KEY, followerUserId INTEGER NOT NULL, followingUserId INTEGER NOT NULL, FOREIGN KEY (followerUserId) REFERENCES users(userId), FOREIGN KEY (followingUserId) REFERENCES users(userId), UNIQUE(followerUserId, followingUserId))')

conn.query('CREATE TRIGGER after_following_insert AFTER INSERT ON following FOR EACH ROW BEGIN ' +
'UPDATE users SET followers = (SELECT COUNT(*) FROM following WHERE followingUserId=NEW.followingUserId) WHERE userId=NEW.followingUserId; ' +
'UPDATE users SET following = (SELECT COUNT(*) FROM following WHERE followerUserId=NEW.followerUserId) WHERE userId=NEW.followerUserId; END;')

conn.query('CREATE TRIGGER after_following_delete AFTER DELETE ON following FOR EACH ROW BEGIN ' +
'UPDATE users SET followers = (SELECT COUNT(*) FROM following WHERE followingUserId=OLD.followingUserId) WHERE userId=OLD.followingUserId; ' +
'UPDATE users SET following = (SELECT COUNT(*) FROM following WHERE followerUserId=OLD.followerUserId) WHERE userId=OLD.followerUserId; ' + 'END;')

conn.query('CREATE TRIGGER after_likes_insert AFTER INSERT ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO notifications (userId, mediaId, activity, dateTime) VALUES ((SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, \'like\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_likes_delete AFTER DELETE ON likes FOR EACH ROW BEGIN ' +
'UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; END;')

conn.query('CREATE TRIGGER after_reposts_insert AFTER INSERT ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO notifications (userId, mediaId, activity, dateTime) VALUES ((SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, \'repost\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_reposts_delete AFTER DELETE ON reposts FOR EACH ROW BEGIN ' +
'UPDATE posts SET reposts = (SELECT COUNT(*) FROM reposts WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; END;')

conn.query('CREATE TRIGGER after_comments_insert AFTER INSERT ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=NEW.mediaId) WHERE mediaId=NEW.mediaId; ' +
'INSERT INTO notifications (userId, mediaId, activity, comment, dateTime) VALUES ((SELECT userId FROM posts WHERE mediaId=NEW.mediaId), NEW.mediaId, \'comment\', \'NEW.comment\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_comments_delete AFTER DELETE ON comments FOR EACH ROW BEGIN ' +
'UPDATE posts SET comments = (SELECT COUNT(*) FROM comments WHERE mediaId=OLD.mediaId) WHERE mediaId=OLD.mediaId; END;')

conn.query('CREATE TRIGGER after_playlistsLikes_insert AFTER INSERT ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO notifications (userId, playlistId, activity, dateTime) VALUES ((SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, \'playlist like\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsLikes_delete AFTER DELETE ON playlistsLikes FOR EACH ROW BEGIN ' +
'UPDATE playlists SET likes = (SELECT COUNT(*) FROM playlistsLikes WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; END;')

conn.query('CREATE TRIGGER after_playlistsReposts_insert AFTER INSERT ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO notifications (userId, playlistId, activity, dateTime) VALUES ((SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, \'playlist repost\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsReposts_delete AFTER DELETE ON playlistsReposts FOR EACH ROW BEGIN ' +
'UPDATE playlists SET reposts = (SELECT COUNT(*) FROM playlistsReposts WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; END;')

conn.query('CREATE TRIGGER after_playlistsFollowers_insert AFTER INSERT ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO notifications (userId, playlistId, activity, dateTime) VALUES ((SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, \'playlist follow\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsFollowers_delete AFTER DELETE ON playlistsFollowers FOR EACH ROW BEGIN ' +
'UPDATE playlists SET followers = (SELECT COUNT(*) FROM playlistsFollowers WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; END;')

conn.query('CREATE TRIGGER after_playlistsComments_insert AFTER INSERT ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=NEW.playlistId) WHERE playlistId=NEW.playlistId; ' +
'INSERT INTO notifications (userId, playlistId, activity, comment, dateTime) VALUES ((SELECT userId FROM playlists WHERE playlistId=NEW.playlistId), NEW.playlistId, \'playlist comment\', \'NEW.comment\', NEW.dateTime); END;')

conn.query('CREATE TRIGGER after_playlistsComments_delete AFTER DELETE ON playlistsComments FOR EACH ROW BEGIN ' +
'UPDATE playlists SET comments = (SELECT COUNT(*) FROM playlistsComments WHERE playlistId=OLD.playlistId) WHERE playlistId=OLD.playlistId; END;')

var insertQuery = ["jbin", "Jennifer Bin", "Shanghai, China", "yuh"];
var insertSQL = 'INSERT INTO users (username, profileName, location, description) ' +
  'VALUES (?, ?, ?, ?)';
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

insertQuery = [1, "Shanghai", "Techwear", "/images/image-1527760266767.jpg", 1, "Jbin in Shanghai"];
insertSQL = 'INSERT INTO posts (userId, title, genre, imageUrl, original, description) ' +
  'VALUES (?, ?, ?, ?, ?, ?)';

conn.query(insertSQL, insertQuery, function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("Records successfully added");
  }
})

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

  insertQuery = [2, "Laundromat", "Streetwear", "/images/image-1529571492908.jpg", 0, "filler"];
  insertSQL = 'INSERT INTO posts (userId, title, genre, imageUrl, original, description)' +
    'VALUES (?, ?, ?, ?, ?, ?)';

  conn.query(insertSQL, insertQuery, function(err, result) {
      if (err) {
        /*TODO: Handle Error*/
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    })

    conn.query('INSERT INTO playlists (userId, title, public, description) VALUES ' +
    '(?,?,?,?)', [1, "Test Playlist", 1, "Test playlist description"], function(err, result) {
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


  conn.query('INSERT INTO playlistsPosts (playlistId, mediaId) VALUES (1,1),(1,2)', function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })

  conn.query('INSERT INTO playlistsReposts (playlistId, userId) VALUES (?,?)', [1,1], function(err, result) {
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
  res.cookie('userId', req.user)
  res.redirect('http://localhost:3000/');
});

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
  var userId = req.user;
  console.log("userId is", userId);
  conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=1', [userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send({username: result[0].username, profileName: result[0].profileName,
        profile_image_src: result[0].profile_image_src});
    }
  })
})

app.get('/api/home', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/home');
  Promise.all([getStream(req.user, req.user, false, false, false, false, false)])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/homeOriginal', loggedIn, (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/homeOriginal');
  Promise.all([getStream(req.user, req.user, false, true, false, false, false)])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/getPlaylists', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/getPlaylists');
  var userId = req.user;
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

app.post('/api/newPlaylist', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/newPlaylist');
  var userId = req.user
  var mediaId = req.body.mediaId
  var title = req.body.title
  var isPublic = req.body.isPublic
  var genre = req.body.genre
  var description = req.body.description

  conn.query('INSERT IGNORE INTO playlists (userId, title, genre, public, description) VALUES (?, ?, ?, ?, ?)', [userId, title, genre, isPublic, description], function(err, result) {
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
  var userId = req.user
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
  var userId = req.user
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
  var userId = req.user;
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

app.post('/api/addToPlaylist', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/addToPlaylist');
  var userId = req.user
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

app.get('/api/you/collections/likes', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/likes');
  var userId = req.user;
  conn.query('SELECT posts.*, b.dateTime AS likeTime, c.username AS username, c.profileName AS profileName, c.profile_image_src AS profile_image_src, ' +
  '((SELECT COUNT(*) FROM reposts WHERE userId=? AND mediaId = posts.mediaId) > 0) AS reposted ' +
  'FROM posts INNER JOIN likes AS b ON posts.mediaId = b.mediaId INNER JOIN users AS c ON c.userId = posts.userId ' +
  'WHERE b.userId=? ORDER BY likeTime DESC', [userId, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var likes = []
      for (var i = 0; i < result.length; i++) {
        var row = result[i]
        likes.push({mediaId:row.mediaId, views:row.views, likes:row.likes,
          reposts:row.reposts, post_image_src:row.imageUrl, title:row.title,
          genre:row.genre, description:row.description, original: row.original,
          username: row.username, profileName: row.profileName, profile_image_src: row.profile_image_src,
          uploadDate: row.dateTime, likeDate: row.likeDate, liked: true, reposted: row.reposted});
      }
      res.send({likes: likes})
    }
  })
})

app.get('/api/you/collections/playlistsLikes', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/playlistsLikes');
  var userId = req.user;
  conn.query('SELECT playlists.*, b.dateTime as likeTime, c.username AS username, c.profileName AS profileName, c.profile_image_src AS profile_image_src, (SELECT imageUrl FROM posts WHERE mediaId = (SELECT mediaId FROM playlistsPosts WHERE playlistId = playlists.playlistId ORDER BY dateTime DESC LIMIT 1)) AS imageUrl, ' +
  '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=? AND playlistId = playlists.playlistId) > 0) AS reposted, ((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=? AND playlistId = playlists.playlistId) > 0) AS playlistFollowed ' +
  'FROM playlists INNER JOIN playlistsLikes AS b ON playlists.playlistId = b.playlistId INNER JOIN users AS c ON c.userId = playlists.userId ' +
  'WHERE b.userId=? ORDER BY likeTime DESC', [userId, userId, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      var likes = []
      for (var i = 0; i < result.length; i++) {
        var row = result[i]
        likes.push({playlistId:row.playlistId, likes:row.likes, reposts:row.reposts,
          followers: row.followers, genre: row.genre, title:row.title, genre:row.genre, imageUrl: row.imageUrl,
          description:row.description, uploadDate:row.dateTime, username: row.username, profile_image_src: row.profile_image_src,
          profileName: row.profileName, likeDate: row.likeDate, liked: true, reposted: row.reposted});
      }
      res.send({likes: likes})
    }
  })
})

app.get('/api/:profile', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile);
  var username = req.params.profile;
  var userId = req.user;

  conn.query('SELECT a.*, (SELECT COUNT(*) FROM posts WHERE userId=(SELECT userId FROM users WHERE username=:username)) AS numPosts, ' +
  '(b.rcount > 0) as isFollowing FROM users AS a, ' +
  '(SELECT COUNT(*) AS rcount FROM following WHERE followingUserId IN (SELECT userId FROM users WHERE username=:username) ' +
  'AND followerUserId=:userId) AS b WHERE a.username=:username',
  {username: username, userId: userId}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result[0];
      var userDetails = {username: username, profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description, isFollowing: row.isFollowing,
        editable: row.userId == userId};

      if (row.userId == userId) {
        console.log("cookie User is same as selected User");
      }

      Promise.all([getStream(userId, row.userId, true, false, false, false, false)])
      .then(function(allData) {
        res.send({media: allData[0], userDetails: userDetails})
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/userDetails', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/userDetails');
  var username = req.params.profile;
  var userId = req.user;

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
  var userId = req.user;
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
  var userId = req.user;
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
  var userId = req.user;
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
  var userId = req.user;
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
  var userId = req.user;
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
  Promise.all([getPostsComments(mediaId, '?')])
  .then(function(allData) {
    res.send({comments: allData[0][mediaId]})
  }).catch(err => {
    console.log(err);
  })
})

app.post('/api/:profile/edit', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/edit');
  var username = req.params.profile;
  var userId = req.user;
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
  var userId = req.user;
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
  var userId = req.user;
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
  var userId = req.user;
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
      var filename = "/images/" + req.file.fieldname + '-' + Date.now() +'.jpg'
      if (req.file.mimetype == 'image/png') {
        fs.writeFile("public" + filename, req.file.buffer, function(err) {
          if (err) {
            console.log(err)
            res.send({message: 'fail'})
          } else {
            Promise.all([uploadImageMetadata(req, filename)])
            .then(function(allData) {
              console.log("Records added successfully");
              res.send({message: 'success'})
            }).catch(e => {
              console.log(e);
              res.send({message: 'fail'})
            })
          }
        })
      } else {
        jo.rotate(req.file.buffer, {}, function(error, buffer) {
          if (error && error.code !== jo.errors.no_orientation && error.code !== jo.errors.correct_orientation) {
            console.log('An error occurred when rotating the file: ' + error.message)
            res.send({message: 'fail'})
          } else {
            fs.writeFile("public" + filename, buffer, function(err) {
              if (err) {
                console.log(err)
                res.send({message: 'fail'})
              } else {
                Promise.all([uploadImageMetadata(req, filename)])
                .then(function(allData) {
                  console.log("Records added successfully");
                  res.send({message: 'success'})
                }).catch(e => {
                  console.log(e);
                  res.send({message: 'fail'})
                })
              }
            })
          }
        })
      }
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
  res.cookie('userId', req.user)
  res.send({message: 'success'});
})

app.post('/api/signin', passport.authenticate('local-login'), function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/signin');
  res.cookie('userId', req.user)
  res.send({message: 'success'});
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
  console.log("loggedIn called. userId is", req.user);
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

function getPlaylistsComments(playlistIds, question_query) {
  return getComments(playlistIds, question_query, 'playlistsComments', 'playlistId')
}

function getPostsComments(mediaIds, question_query) {
  return getComments(mediaIds, question_query, 'comments', 'mediaId')
}

function getComments(ids, question_query, commentsTable, idType) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT ' + commentsTable + '.*, a.profileName as profileName, a.userName as username, ' +
    'a.location as location, a.followers as userFollowers, ((SELECT COUNT(*) FROM following WHERE followerUserId=?1 AND followingUserId = a.userId) > 0) AS userFollowed' +
    ' FROM ' + commentsTable + ' INNER JOIN users AS a ON a.userId = ' + commentsTable + '.userId ' +
    'WHERE ' + idType + ' IN (' + question_query + ') ORDER BY dateTime DESC', ids, function(err, result) {
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
              commentId: row.commentId, comment: row.comment, dateTime: row.dateTime,
              location: row.location, userFollowers: row.userFollowers, userFollowed: row.userFollowed})
          } else {
            comments[id] = [];
            comments[id].push({username: row.username, profileName: row.profileName,
              commentId: row.commentId, comment: row.comment, dateTime: row.dateTime,
              location: row.location, userFollowers: row.userFollowers, userFollowed: row.userFollowed})
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
      Promise.all([getTagDetailsRevised(mediaIds, question_query), getPostsComments(mediaIds, question_query)])
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
      insertQuery.push(mediaId, inputTags[i].itemType, inputTags[i].itemName, inputTags[i].itemBrand, inputTags[i].original, inputTags[i].x, inputTags[i].y);
      question_query += '(?, ?, ?, ?, ?, ?, ?),';
    }
    question_query = question_query.slice(0, -1);
    conn.query('INSERT INTO tags (mediaId, itemType, itemName, itemBrand, original, x, y) VALUES ' + question_query, insertQuery, function(err, reuslt) {
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
      profileToggle1 = 'playlistsReposts.userId IN (SELECT followingUserId FROM following WHERE followerUserId=:userId) OR '
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

    var userPlaylistReposts = 'SELECT null as mediaId, a.playlistId, a.title, a.genre, a.public, null as original, null as imageUrl, ' +
    'null AS views, a.likes, a.reposts, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, playlistsReposts.dateTime as orderTime, ' +
    'b.username AS repost_username, b.profileName AS repost_profileName, b.profile_image_src AS repost_profile_image_src, b.location AS repost_location, b.followers AS repost_userFollowers, ' +
    'c.username AS username, c.profileName AS profileName, c.profile_image_src AS profile_image_src, c.location AS location, c.followers AS userFollowers, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = a.userId) > 0) AS userFollowed, ((SELECT COUNT(*) FROM following WHERE followerUserId=a.userId AND followingUserId = :cookieUser) > 0) AS followsYou, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = b.userId) > 0) AS repost_userFollowed, null AS postTags, GROUP_CONCAT(d.comment, d.dateTime) AS playlistComments, null AS postComments, GROUP_CONCAT(f.title, f.original, f.imageUrl, f.views, f.likes, f.reposts, e.dateTime) AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS reposted, ((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster, (b.userId = :cookieUser) AS isReposter ' +
    'FROM playlistsReposts INNER JOIN playlists AS a ON a.playlistId = playlistsReposts.playlistId INNER JOIN users AS c ON c.userId = a.userId INNER JOIN users AS b ON b.userId = playlistsReposts.userId LEFT JOIN playlistsComments AS d ON d.playlistId = playlistsReposts.playlistId LEFT JOIN playlistsPosts AS e ON e.playlistId = playlistsReposts.playlistId LEFT JOIN posts AS f ON f.mediaId = e.mediaId ' +
    'WHERE ' + profileToggle1 + 'playlistsReposts.userId=:userId GROUP BY playlistsReposts.repostId'

    var userPlaylistPosts = 'SELECT null as mediaId, a.playlistId, a.title, a.genre, a.public, null as original, null as imageUrl, ' +
    'null AS views, a.likes, a.reposts, a.followers AS playlistFollowers, a.description, a.dateTime AS uploadDate, a.dateTime as orderTime, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, null AS repost_location, null AS repost_userFollowers, ' +
    'username AS username, profileName AS profileName, profile_image_src AS profile_image_src, location AS location, users.followers AS userFollowers, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = a.userId) > 0) AS userFollowed, ((SELECT COUNT(*) FROM following WHERE followerUserId=a.userId AND followingUserId = :cookieUser) > 0) AS followsYou, ' +
    'null AS repost_userFollowed, null AS postTags, GROUP_CONCAT(playlistsComments.comment, playlistsComments.dateTime) AS playlistComments, null AS postComments, GROUP_CONCAT(posts.title, posts.original, posts.imageUrl, posts.views, posts.likes, posts.reposts, playlistsPosts.dateTime) AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM playlistsReposts WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS reposted, ((SELECT COUNT(*) FROM playlistsLikes WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS liked, ((SELECT COUNT(*) FROM playlistsFollowers WHERE userId=:cookieUser AND playlistId = a.playlistId) > 0) AS followed, ' +
    '(a.userId = :cookieUser) AS isPoster, false AS isReposter ' +
    'FROM playlists AS a INNER JOIN users ON users.userId = a.userId LEFT JOIN playlistsComments ON playlistsComments.playlistId = a.playlistId LEFT JOIN playlistsPosts ON playlistsPosts.playlistId = a.playlistId LEFT JOIN posts ON posts.mediaId = playlistsPosts.mediaId WHERE ' + profileToggle2 + 'a.userId=:userId GROUP BY a.playlistId'

    var userReposts = 'SELECT a.mediaId, null as playlistId, a.title, a.genre, null, a.original, a.imageUrl, a.views, ' +
    'a.likes, a.reposts, null as playlistFollowers, a.description, a.dateTime AS uploadDate, reposts.dateTime as orderTime, ' +
    'b.username as repost_username, b.profileName as repost_profileName, b.profile_image_src AS repost_profile_image_src, b.location AS repost_location, b.followers AS repost_userFollowers, ' +
    'c.username AS username, c.profileName as profileName, c.profile_image_src AS profile_image_src, c.location AS location, c.followers AS userFollowers, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = a.userId) > 0) AS userFollowed, ((SELECT COUNT(*) FROM following WHERE followerUserId=a.userId AND followingUserId = :cookieUser) > 0) AS followsYou, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = b.userId) > 0) AS repost_userFollowed, GROUP_CONCAT(d.itemType, d.itemName, d.itemBrand, d.original, d.x, d.y) AS postTags, null AS playlistComments, GROUP_CONCAT(e.comment, e.dateTime) AS postComments, null AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:cookieUser AND mediaId = a.mediaId) > 0) AS reposted, ((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = a.mediaId) > 0) AS liked, null AS followed, (a.userId = :cookieUser) AS isPoster, (b.userId = :cookieUser) AS isReposter ' +
    'FROM reposts INNER JOIN posts AS a ON a.mediaId = reposts.mediaId INNER JOIN users AS c ON c.userId = a.userId INNER JOIN users AS b ON b.userId = reposts.userId LEFT JOIN tags AS d ON d.mediaId = reposts.mediaId LEFT JOIN comments AS e ON e.mediaId = reposts.mediaId ' +
    'WHERE (' + profileToggle3 + 'reposts.userId=:userId) ' + originalToggle2 + ' GROUP BY reposts.repostId'

    var userPosts = 'SELECT posts.mediaId, null as playlistId, title, genre, null, posts.original, imageUrl, views, likes, reposts, ' +
    'null as playlistFollowers, posts.description, posts.dateTime AS uploadDate, posts.dateTime as orderTime, ' +
    'null as repost_username, null as repost_profileName, null AS repost_profile_image_src, null AS repost_location, null AS repost_userFollowers, ' +
    'username AS username, profileName AS profileName, profile_image_src AS profile_image_src, location AS location, followers AS userFollowers, ' +
    '((SELECT COUNT(*) FROM following WHERE followerUserId=:cookieUser AND followingUserId = posts.userId) > 0) AS userFollowed, ((SELECT COUNT(*) FROM following WHERE followerUserId=posts.userId AND followingUserId = :cookieUser) > 0) AS followsYou, ' +
    'null AS repost_userFollowed, GROUP_CONCAT(tags.itemType, tags.itemName, tags.itemBrand, tags.original, tags.x, tags.y) AS postTags, null AS playlistComments, GROUP_CONCAT(comments.comment, comments.dateTime) AS postComments, null AS playlistPosts, ' +
    '((SELECT COUNT(*) FROM reposts WHERE userId=:cookieUser AND mediaId = posts.mediaId) > 0) AS reposted, ((SELECT COUNT(*) FROM likes WHERE userId=:cookieUser AND mediaId = posts.mediaId) > 0) AS liked, null AS followed, (posts.userId = :cookieUser) AS isPoster, false AS isReposter ' +
    'FROM posts INNER JOIN users ON users.userId = posts.userId LEFT JOIN tags ON tags.mediaId = posts.mediaId LEFT JOIN comments ON comments.mediaId = posts.mediaId WHERE (' + profileToggle4 + 'posts.userId=:userId) ' + originalToggle1 + ' GROUP BY posts.mediaId'

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
      // queryString = userPosts + orderBy
      console.log(queryString);
    }

    conn.query(queryString, {cookieUser: cookieUser, userId: userId}, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        console.log(result);
        // var mediaIds = []
        // var playlistIds = []
        // mediaIds.push(userId)
        // playlistIds.push(userId)
        // var media_question_query = ''
        // var playlist_question_query = ''
        // for (var i = 0; i < result.length; i++) {
        //   playlistIds.push(result[i].playlistId)
        //   mediaIds.push(result[i].mediaId)
        //   media_question_query += '?' + (i+2) + ','
        //   playlist_question_query += '?' + (i+2) + ','
        // }
        // media_question_query = media_question_query.slice(0, -1);
        // playlist_question_query = playlist_question_query.slice(0, -1);
        // Promise.all([getTagDetailsRevised(mediaIds, media_question_query), getPostsComments(mediaIds, media_question_query),
        //   getPlaylistsPosts(playlistIds, playlist_question_query), getPlaylistsComments(playlistIds, playlist_question_query)])
        // .then(function(allData) {
          var stream = []
          for (var i = 0; i < result.length; i++) {
            var row = result[i]
            var mediaId = row.mediaId
            var playlistId = row.playlistId
            if (mediaId) {
                var post = {mediaId:row.mediaId, views:row.views, likes:row.likes,
                reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
                title:row.title, genre:row.genre, description:row.description,
                date:row.dateTime, original: row.original, username: row.username,
                profileName: row.profileName, profile_image_src: row.profile_image_src,
                location: row.location, userFollowers: row.userFollowers,
                tags:row.post_tags, comments:row.postComments, uploadDate: row.uploadDate,
                repost_username: row.repost_username, repost_profileName: row.repost_profileName,
                repost_profile_image_src: row.repost_profile_image_src, repostDate: row.orderTime,
                repost_location: row.repost_location, repost_userFollowers: row.repost_userFollowers,
                reposted: row.reposted, liked: row.liked, userFollowed: row.userFollowed, followsYou: row.followsYou,
                repost_userFollowed: row.repost_userFollowed, isPoster: row.isPoster, isReposter: row.isReposter}
              stream.push(post)
            } else if (playlistId) {
              var playlist = {playlistId:row.playlistId, likes:row.likes, reposts:row.reposts,
                genre: row.genre, comments:row.comments, followers: row.playlistFollowers, title:row.title,
                description:row.description, uploadDate:row.uploadDate, public: row.public,
                repost_username: row.repost_username, repost_profileName: row.repost_profileName,
                repost_location: row.repost_location, repost_userFollowers: row.repost_userFollowers,
                repost_profile_image_src: row.repost_profile_image_src, repostDate: row.orderTime,
                username: row.username, profileName: row.profileName, profile_image_src: row.profile_image_src,
                location: row.location, userFollowers: row.userFollowers,
                comments:row.postComments, posts: row.playlistPosts, reposted: row.reposted,
                liked: row.liked, followed: row.followed, userFollowed: row.userFollowed, followsYou: row.followsYou,
                repost_userFollowed: row.repost_userFollowed, isPoster: row.isPoster, isReposter: row.isReposter}
              stream.push(playlist)
            }
        //     } else {
        //       return reject("ERROR - Neither post or playlist");
        //     }
        //   }
        //   return resolve({stream: stream})
        // }).catch(err => {
        //   return reject(err);
        // })
      }
        return resolve({stream: stream})
    }
  })
  })
}

function addToCollection(req, table, idType) {
  return new Promise(function(resolve, reject) {
    var userId = req.user;
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
    var userId = req.user;
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

function uploadImageMetadata(req, filename) {
  return new Promise(function(resolve, reject) {
    var insertQuery = [req.user, req.body.title, req.body.genre, filename,
      req.body.original, 0, 0, 0, 0, req.body.description];
    conn.query('INSERT INTO posts (userId, title, genre, imageUrl, ' +
    'original, views, likes, reposts, comments, description) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
      if (err) {
        console.log("upload error");
        return reject(err);
      } else {
        if (JSON.parse(req.body.inputTags).length > 0) {
          Promise.all([postTagsFromUploadRevised(result.insertId, JSON.parse(req.body.inputTags))])
          .then(function(allData) {
            return resolve({message: 'success'})
          }).catch(e => {
            return reject(e);
          })
        } else {
          return resolve({message: 'success'})
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
