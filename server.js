// use strict compiling
"use strict";
// var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var path = require('path');
var colors = require('colors');
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var RedditStrategy = require('passport-reddit').Strategy
var session = require('express-session');
var bcrypt = require('bcrypt');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
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

passport.use(new LocalStrategy(
 function(username, password, done) {
   conn.query('SELECT * FROM logins WHERE username=$1', username, function(err, result) {
      if (err) {
        return done(err)
      }
      if (!result) {
        return done(null, false)
      }
      bcrypt.compare(password, result.rows[0].passwordHash, (err, isValid) => {
        if (err) {
          return done(err)
        }
        if (!isValid) {
          return done(null, false)
        }
        return done(null, result.rows[0].relatedUserId)
      })
    })
  }
))

var storage = multer.diskStorage({
    destination: function(request, file, callback) {
      callback(null, 'public/images')
    },
    filename: function(request, file, callback) {
      callback(null, file.fieldname + '-' + Date.now() +'.jpg')
    },
});

var upload = multer({
  storage: storage,
  limits: {fileSize: 10000000, files: 1},
  fileFilter: function(request, file, callback) {
     var ext = path.extname(file.originalname)
     if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          return callback(new Error('Only images are allowed'), false);
      }
      callback(null, true)
  }
}).single('image');

// serve static files
// app.use(express.static('dist'));
var conn = anyDB.createConnection('sqlite3://fashion.db');

conn.query('DROP TABLE IF EXISTS posts');
conn.query('DROP TABLE IF EXISTS logins');
conn.query('DROP TABLE IF EXISTS users');
conn.query('DROP TABLE IF EXISTS following');
conn.query('DROP TABLE IF EXISTS tags');
conn.query('DROP TABLE IF EXISTS postTags');
conn.query('DROP TABLE IF EXISTS reposts');
conn.query('DROP TABLE IF EXISTS likes');
conn.query('DROP TABLE IF EXISTS views');
conn.query('DROP TABLE IF EXISTS comments');
conn.query('DROP TABLE IF EXISTS playlists');
conn.query('DROP TABLE IF EXISTS playlistsPosts');
conn.query('DROP TABLE IF EXISTS playlistsFollowers');
conn.query('DROP TABLE IF EXISTS playlistsReposts');
conn.query('DROP TABLE IF EXISTS playlistsLikes');

conn.query('CREATE TABLE IF NOT EXISTS posts (mediaId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'userId INTEGER, title TEXT NOT NULL, public BOOLEAN, genre TEXT, ' +
'imageUrl TEXT NOT NULL UNIQUE, original INTEGER, views INTEGER, likes INTEGER, reposts INTEGER, ' +
'comments INTEGER, description TEXT, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS logins (loginId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, passwordText TEXT, passwordSalt TEXT, ' +
'passwordHash CHAR(60), passwordHashAlgorithm TEXT, relatedUserId INTEGER UNIQUE)');

conn.query('CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'username TEXT NOT NULL UNIQUE, profileName TEXT NOT NULL, profile_image_src TEXT, ' +
'location TEXT, followers INTEGER, following INTEGER, numPosts INTEGER, description TEXT)');


conn.query('CREATE TABLE IF NOT EXISTS following (userId INTEGER, followingId INTEGER' +
', dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS tags (tagId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'itemType TEXT, itemName TEXT, itemBrand TEXT, original BOOLEAN)');

conn.query('CREATE TABLE IF NOT EXISTS postTags (mediaId INTEGER, tagId INTEGER)');

conn.query('CREATE TABLE IF NOT EXISTS reposts (mediaId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS likes (mediaId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS views (mediaId INTEGER, userId INTEGER, IP_Address TEXT, viewCount INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS comments (commentId INTEGER PRIMARY KEY AUTOINCREMENT, mediaId INTEGER, userId INTEGER, comment TEXT, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'userId INTEGER, title TEXT, genre TEXT, public BOOLEAN, likes INTEGER, reposts INTEGER, comments INTEGER, ' +
'followers INTEGER, description TEXT, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistId INTEGER, mediaId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsReposts (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsLikes (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

bcrypt.hash('password', 10, function(err, hash) {
  conn.query('INSERT INTO logins (username, email, passwordText, passwordHash, relatedUserId) VALUES (?,?,?,?,?)',
    ['jbin', 'jbin', 'password', hash, 1], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  })
});


var insertQuery = ["jbin", "Jennifer Bin", "Shanghai, China", 1450, 288, 2, "yuh", '/profile_images/jbin-2.jpg'];
var insertSQL = 'INSERT INTO users (username, profileName, location, followers, following, numPosts, description, profile_image_src)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

insertQuery = ["tkd", "The Killa Detail", "Perth, Australia", 954, 80, 2, "filler description", '/profile_images/tkd-pfp.jpg'];
insertSQL = 'INSERT INTO users (username, profileName, location, followers, following, numPosts, description, profile_image_src)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

insertQuery = [1, "Shanghai", "Techwear", "/images/image-1527760266767.jpg", 1, 840, 120, 44, 21, "Jbin in Shanghai", Date.now()];
insertSQL = 'INSERT INTO posts (userId, title, genre, imageUrl, original, views, likes, reposts, comments, description, dateTime)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

insertQuery = [2, "Laundromat", "Streetwear", "/images/image-1529571492908.jpg", 1, 840, 120, 44, 21, "filler", Date.now()];
insertSQL = 'INSERT INTO posts (userId, title, genre, imageUrl, original, views, likes, reposts, comments, description, dateTime)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

insertQuery = ["shoes", "Nike x Comme des Garcons", "Black Vapormaxes", 1];
insertSQL = 'INSERT INTO tags (itemType, itemBrand, itemName, original)' +
  'VALUES (?, ?, ?, ?)';
  conn.query(insertSQL, insertQuery, function(err, result) {
      if (err) {
        /*TODO: Handle Error*/
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    });

conn.query('INSERT INTO postTags (tagId, mediaId) VALUES (?, ?)', [1, 1], function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

conn.query('INSERT INTO comments (mediaId, userId, comment, dateTime) VALUES (?, ?, ?, ?)', [1, 1, "this is dope", Date.now()], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
  });

  conn.query('INSERT INTO comments (mediaId, userId, comment, dateTime) VALUES (?, ?, ?, ?)', [1, 1, "e", Date.now()], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Records successfully added");
      }
    });

conn.query('INSERT INTO playlists (userId, title, public, likes, reposts, comments, followers, description, dateTime) VALUES ' +
'(?,?,?,?,?,?,?,?,?)', [1, "Test Playlist", 1, 100, 20, 10, 5, "Test playlist description", Date.now()], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Records successfully added");
    }
});

conn.query('INSERT INTO playlistsPosts (playlistId, mediaId, dateTime) VALUES (?,?,?),(?,?,?)', [1,1,Date.now(),1,2,Date.now()], function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("Records successfully added");
  }
})

conn.query('INSERT INTO playlistsReposts (playlistId, userId, dateTime) VALUES (?,?,?)', [1,2,Date.now()], function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("Records successfully added");
  }
})

app.get('/api/navbar', (req, res) => {
  var userId = req.user;
  if (userId == null) {
    res.redirect('/home')
  }
  else {
    conn.query('SELECT username, profileName, profile_image_src FROM users WHERE userId=$1', userId, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        res.send({username: result.rows[0].username, profileName: result.rows[0].profileName,
          profile_image_src: result.rows[0].profile_image_src});
      }
    })
  }
})

app.get('/api/home', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/home');
  var userId = req.user;
  if (userId == null) {
    res.redirect('/home')
  } else {
    Promise.all([getStream(userId, true)])
    .then(function(allData) {
      res.send(allData[0])
    }).catch(err => {
      console.log(err);
    })
  }
})

app.post('/api/like', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/like');
  Promise.all([addToCollection(req, 'likes', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/repost', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/repost');
  Promise.all([addToCollection(req, 'reposts', 'mediaId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistLike', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistLike');
  Promise.all([addToCollection(req, 'playlistsLikes', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/playlistRepost', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/playlistRepost');
  Promise.all([addToCollection(req, 'playlistsReposts', 'playlistId')])
  .then(function(allData) {
    res.send(allData[0])
  }).catch(err => {
    console.log(err);
    res.send({message: 'failed'})
  })
})

app.post('/api/comment', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/comment');
  var userId = req.user;
  var mediaId = req.body.mediaId;
  var comment = req.body.comment;
  conn.query('INSERT INTO comments (mediaId, userId, comment, dateTime) VALUES ($1, $2, $3, $4)',
  [mediaId, userId, comment, Date.now()], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      conn.query('UPDATE posts SET comments = comments + 1 WHERE mediaId=$1', mediaId, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("commented successfully");
          res.send({message: "success"})
        }
      })
    }
  })
})

app.get('/api/you/collections/likes', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/likes');
  var userId = req.user;
  conn.query('SELECT a.*, b.dateTime AS likeTime, c.username AS username, c.profileName AS profileName ' +
  'FROM posts AS a, likes AS b, users AS c WHERE a.mediaId = b.mediaId AND b.userId=$1 AND ' +
  'c.userId = a.userId ORDER BY likeTime DESC', userId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var likes = []
      for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i]
        likes.push({mediaId:row.mediaId, views:row.views, likes:row.likes,
          reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
          title:row.title, genre:row.genre, description:row.description,
          original: row.original, username: row.username, profileName: row.profileName,
          uploadDate: row.dateTime, likeDate: row.likeDate});
      }
      res.send({likes: likes})
    }
  })
})

app.get('/api/you/collections/playlistsLikes', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/playlistsLikes');
  var userId = req.user;
  conn.query('SELECT a.*, b.dateTime as likeTime, c.username AS username, c.profileName AS profileName ' +
  'FROM playlists AS a, playlistsLikes as b, users AS c WHERE a.playlistId = b.playlistId AND b.userId=$1 AND ' +
  'c.userId = a.userId ORDER BY likeTime DESC', userId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      var likes = []
      for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i]
        likes.push({playlistId:row.playlistId, likes:row.likes, reposts:row.reposts,
          comments:row.comments, genre: row.genre, title:row.title, genre:row.genre,
          description:row.description, uploadDate:row.dateTime, username: row.username,
          profileName: row.profileName, likeDate: row.likeDate});
      }
      res.send({likes: likes})
    }
  })
})

app.get('/api/:profile', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile);
  var username = req.params.profile;
  var userId = req.user;

  conn.query('SELECT a.*, (b.rcount > 0) as isFollowing FROM users AS a, ' +
  '(SELECT COUNT(*) AS rcount FROM following WHERE followingId IN (SELECT userId FROM users WHERE username=$1) ' +
  'AND userId=$2) AS b WHERE a.username=$1',
  [username, userId], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      var row = result.rows[0];
      var userDetails = {userId: row.userId, username: username,
        profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description, isFollowing: row.isFollowing};

      if (row.userId == userId) {
        console.log("cookie User is same as selected User");
      }

      Promise.all([getStream(row.userId, false)])
      .then(function(allData) {
        res.send({media:allData[0], userDetails: userDetails})
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/:profile/:mediaId', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/' + request.params.profile + '/' + request.params.mediaId);
  var username = request.params.profile;
  var mediaId = request.params.mediaId;
})

app.post('/api/:profile/follow', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/follow');
  var username = req.params.profile;
  var userId = req.user;

  conn.query('INSERT INTO following (followingId, userId, dateTime) VALUES ((SELECT userId FROM users WHERE username=$1),$2,$3)',
  [username, userId, Date.now()], function(err, result) {
    if (err) {
      console.log("insert error");
      console.log(err);
    } else {
      conn.query('UPDATE users SET followers = followers + 1 WHERE username=$1', [username], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          conn.query('UPDATE users SET following = following + 1 WHERE userId=$1', [userId], function(err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({message: 'success'})
            }
          })
        }
      })
    }
  })
})

app.post('/api/:profile/unfollow', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/unfollow');
  var username = req.params.profile;
  var userId = req.user;

  conn.query('DELETE FROM following WHERE followingId IN (SELECT userId FROM users WHERE username=$1) AND userId=$2',
  [username, userId], function(err, result) {
    if (err) {
      console.log("delete error");
      console.log(err);
    } else {
      conn.query('UPDATE users SET followers = followers - 1 WHERE username=$1', [username], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          conn.query('UPDATE users SET following = following - 1 WHERE userId=$1', [userId], function(err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({message: 'success'})
            }
          })
        }
      })
    }
  })
})

app.get('/api/:profile/playlist/:playlistId', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/' + request.params.profile + '/playlist/' + request.params.playlistId);
  var username = request.params.profile;
  var playlistId = request.params.playlistId;
  conn.query('SELECT mediaId, dateTime FROM playlistsLikes WHERE playlistId=$1 ORDER BY dateTime DESC', playlistId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var mediaIds = []
      var sources = []
      var question_query = ''
      for (var i = 0; i < result.rows.length; i++) {
        mediaIds.push(result.rows[i].mediaId)
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

app.post('/api/upload', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/upload');
  var userId = request.user;
  console.log("userId is", userId);
  upload(request, response, function(err) {
    if (err) {
      response.send({message: err.message})
      console.log(err);
    } else {
      var insertQuery = [userId, request.body.title, request.body.genre, '/images/'+ request.file.filename,
        request.body.original, 0, 0, 0, 0, request.body.description, Date.now()];
      conn.query('INSERT INTO posts (userId, title, genre, imageUrl, ' +
      'original, views, likes, reposts, comments, description, dateTime)' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', insertQuery, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          Promise.all([postTagsFromUpload(result.lastInsertId, JSON.parse(request.body.inputTags))])
          .then(function(allData) {
            console.log("Records added successfully");
            response.send({message: 'Post Uploaded Successfully!'})
          }).catch(e => {
            console.log(e);
          })
        }
      })
    }
  })
});

app.post('/api/signup', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/signup');
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  conn.query('INSERT INTO users (username, profileName) VALUES (?,?)', [username, username], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var relatedUserId = result.lastInsertId;
      bcrypt.hash(password, 10, function(err, hash) {
      conn.query('INSERT INTO logins (username, email, passwordText, passwordHash, relatedUserId) VALUES (?,?,?,?,?)',
        [username, email, password, hash, relatedUserId], function(err, result) {
          if (err) {
            console.log(err);
          } else {
            req.session.userId = relatedUserId;
            res.redirect('/');
          }
        })
      })
    }
  })
})

app.post('/api/signin', passport.authenticate('local'), function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/signin');
  res.redirect('/');
});


app.listen(8081, function(){
    console.log('- Server listening on port 8081');
});

function getUserDetails(userIds, question_query) {
  return new Promise(function(resolve, reject) {
      conn.query('SELECT userId, username, profileName, profile_image_src FROM users WHERE userId IN (' + question_query + ')',
        userIds, function(err, result) {
        if (err) {
          return reject(err);
        } else {
          var users = {};
          for(var row in result.rows) {
            users[result.rows[row].userId] = {username: result.rows[row].username,
              profileName: result.rows[row].profileName, profile_image_src: result.rows[row].profile_image_src}
          }
          return resolve(users);
        }
      });
    })
}

function getTagDetails(mediaIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT a.*, b.mediaId as mediaId FROM tags AS a, postTags AS b ' +
    'WHERE a.tagId=b.tagId AND b.mediaId IN (' + question_query + ')', mediaIds, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        var postTags = {};
        for(var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i]
          var mediaId = row.mediaId
          if (postTags[mediaId]) {
            postTags[mediaId].push({itemType: row.itemType, itemBrand: row.itemBrand,
              itemName: row.itemName, original: row.original})
          } else {
            postTags[mediaId] = [];
            postTags[mediaId].push({itemType: row.itemType, itemBrand: row.itemBrand,
              itemName: row.itemName, original: row.original})
          }
        }
        return resolve(postTags)
      }
    })
  })
}

function getComments(mediaIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT a.*, b.profileName as profileName, b.userName as username FROM comments AS a, users AS b ' +
    'WHERE b.userId=a.userId AND a.mediaId IN (' + question_query + ') ORDER BY dateTime DESC', mediaIds, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        var comments = {};
        for(var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i]
          var mediaId = row.mediaId
          if (comments[mediaId]) {
            comments[mediaId].push({username: row.username, profileName: row.profileName,
              commentId: row.commentId, comment: row.comment, dateTime: row.dateTime})
          } else {
            comments[mediaId] = [];
            comments[mediaId].push({username: row.username, profileName: row.profileName,
              commentId: row.commentId, comment: row.comment, dateTime: row.dateTime})
          }
        }
        return resolve(comments)
      }
    })
  })
}

function getPlaylistsPosts(playlistIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT a.*, b.playlistId as playlistId, c.username AS username , c.profileName AS profileName ' +
    'FROM posts AS a, playlistsPosts AS b, users AS c WHERE a.mediaId = b.mediaId AND c.userId = a.userId ' +
    'AND b.playlistId IN (SELECT playlistId FROM playlistsPosts WHERE playlistId IN (' + question_query + '))',
    playlistIds, function(err, result) {
      var mediaIds = []
      question_query = ''
      for (var i = 0; i < result.rows.length; i++) {
        mediaIds.push(result.rows[i].mediaId)
        question_query += '?,'
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getTagDetails(mediaIds, question_query)])
      .then(function(allData) {
        var playlistsPosts = {}
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i]
          var playlistId = row.playlistId
          var post = {mediaId:row.mediaId, playlistId: playlistId, views:row.views, likes:row.likes,
            reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
            title:row.title, genre:row.genre, description:row.description,
            date:row.dateTime, original: row.original, username: row.username, profileName: row.profileName,
            tags:allData[0][row.mediaId], dateTime: row.dateTime}
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

function postTagsFromUpload(mediaId, inputTags) {
  return new Promise(function(resolve, reject) {
    var question_query = '';
    var insertQuery = [];
    for (var i = 0; i < inputTags.length; i++) {
      insertQuery.push(inputTags[i].itemType, inputTags[i].itemName, inputTags[i].itemBrand, inputTags[i].original);
      question_query += '(?, ?, ?, ?),';
    }
    question_query = question_query.slice(0, -1);
    conn.query('INSERT INTO tags (itemType, itemName, itemBrand, original) VALUES ' + question_query, insertQuery, function(err, result) {
      if (err) {
        return reject(err)
      } else {
        console.log("first inserted tagId is", result.lastInsertId);
        var tagId = result.lastInsertId - inputTags.length + 1;
        question_query = '';
        insertQuery = [];
        for (var i = 0; i < inputTags.length; i++) {
          insertQuery.push(mediaId, tagId + i)
          question_query += '(?,?),'
        }
        console.log("insertQuery is", insertQuery);
        question_query = question_query.slice(0, -1);
        conn.query('INSERT INTO postTags (mediaId, tagId) VALUES ' + question_query, insertQuery, function(err, result) {
          if (err) {
            return reject(err)
          } else {
            return resolve({message: 'success'});
          }
        })
      }
    })
  })
}

function getStream(userId, isHome) {
  return new Promise(function(resolve, reject) {
    var followingQuery1 = ''
    var followingQuery2 = ''
    if (isHome) {
      followingQuery1 = ' OR b.userId IN (SELECT followingId FROM following WHERE userId=$1)'
      followingQuery2 = ' OR userId IN (SELECT followingId as userId FROM following WHERE userId=$1)'
    }
    conn.query(
    'SELECT null as mediaId, a.playlistId, a.userId, a.title, a.genre, a.public, null as original, null as imageUrl, ' +
    'null AS views, a.likes, a.reposts, a.comments, a.followers, a.description, a.dateTime, b.dateTime as orderTime, b.userId as reposter ' +
    'FROM playlists AS a, playlistsReposts AS b WHERE a.playlistId = b.playlistId AND (b.userId=$1' + followingQuery1 + ') UNION ALL ' +
    'SELECT null as mediaId, playlistId, userId, title, genre, public, null as original, null as imageUrl, ' +
    'null AS views, likes, reposts, comments, followers, description, dateTime, dateTime as orderTime, null as reposter ' +
    'FROM playlists WHERE userId=$1' + followingQuery2 + ' UNION ALL ' +
    'SELECT a.mediaId, null as playlistId, a.userId, a.title, a.genre, a.public, a.original, a.imageUrl, a.views, ' +
    'a.likes, a.reposts, a.comments, null as followers, a.description, a.dateTime, b.dateTime as orderTime, b.userId as reposter ' +
    'FROM posts AS a, reposts AS b WHERE a.mediaId = b.mediaId AND (b.userId=$1' + followingQuery1 + ') UNION ALL ' +
    'SELECT mediaId, null as playlistId, userId, title, genre, public, original, imageUrl, views, likes, reposts, ' +
    'comments, null as followers, description, dateTime, dateTime as orderTime, null as reposter ' +
    'FROM posts WHERE userId=$1' + followingQuery2 + ' ORDER BY orderTime DESC LIMIT 20',
    userId, function(err,result) {
      if (err) {
        return reject(err)
      } else {
        var mediaIds = []
        var userIds = []
        var playlistIds = []
        var media_question_query = ''
        var user_question_query = ''
        for (var i = 0; i < result.rows.length; i++) {
          userIds.push(result.rows[i].reposter, result.rows[i].userId)
          user_question_query += '?,?,'
          playlistIds.push(result.rows[i].playlistId)
          mediaIds.push(result.rows[i].mediaId)
          media_question_query += '?,'
        }
        user_question_query = user_question_query.slice(0, -1)
        media_question_query = media_question_query.slice(0, -1);
        Promise.all([getUserDetails(userIds, user_question_query), getTagDetails(mediaIds, media_question_query),
          getComments(mediaIds, media_question_query), getPlaylistsPosts(playlistIds, media_question_query)])
        .then(function(allData) {
          var stream = []
          for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i]
            var mediaId = row.mediaId
            var playlistId = row.playlistId
            if (mediaId) {
              var post = {mediaId:row.mediaId, views:row.views, likes:row.likes,
                reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
                title:row.title, genre:row.genre, description:row.description,
                date:row.dateTime, original: row.original, user:allData[0][row.userId],
                tags:allData[1][row.mediaId], comments:allData[2][row.mediaId], uploadDate: row.dateTime,
                reposter: allData[0][row.reposter], repostDate: row.orderTime}
              stream.push(post)
            } else if (playlistId) {
              var playlist = {playlistId:row.playlistId, likes:row.likes, reposts:row.reposts,
                genre: row.genre, comments:row.comments, followers: row.followers, title:row.title,
                description:row.description, uploadDate:row.dateTime, public: row.public,
                reposter: allData[0][row.reposter], repostDate: row.orderTime,
                user:allData[0][row.userId], posts: allData[3][row.playlistId]}
              stream.push(playlist)
            } else {
              return reject("ERROR - Neither post or playlist");
            }
          }
          return resolve({stream: stream})
        }).catch(err => {
          return reject(err);
        })
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
    conn.query('INSERT INTO ' + table + ' (' + idType  + ', userId, dateTime) VALUES ($1,$2,$3)',
    [id, userId, Date.now()], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        conn.query('UPDATE ' + postsOrPlaylists + ' SET ' + likesOrReposts + ' = ' + likesOrReposts + ' + 1 WHERE ' + idType + '=$1', result.lastInsertId, function(err, result) {
          if (err) {
            return reject(err);
          } else {
            console.log(table + "ed post successfully");
            return resolve({message: "success"})
          }
        })
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
    var id = ''
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
    conn.query('DELETE FROM ' + table + ' WHERE mediaId=$2, userId=$1', [id, userId], function(err, result) {
      if (err) {
        return reject(err);
      } else {
        conn.query('UPDATE ' + postsOrPlaylists + ' SET ' + likesOrReposts + ' = ' + likesOrReposts + ' - 1 WHERE ' + idType + '=$1', id, function(err, result) {
          if (err) {
            return reject(err);
          } else {
            console.log(table + "ed post successfully");
            return resolve({message: "success"})
          }
        })
      }
    })
  })
}
