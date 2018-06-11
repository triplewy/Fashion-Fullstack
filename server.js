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
var cookieSession = require('cookie-session');
var bcrypt = require('bcrypt');

var conn = anyDB.createConnection('sqlite3://fashion.db');

var app = express();
// app.use(function(req, res, next) {
//   console.log("CORS shit");
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
//   res.header('Acess-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//   if ('OPTIONS' == req.method) {
//     res.send(200);
//   } else {
//     next();
//   }
// })
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieSession({secret: 'secret'}));
app.use(passport.initialize())
app.use(passport.session())

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

passport.serializeUser(function(userId, done) {
  console.log("serializeUser userId is", userId);
	done(null, userId);
})

passport.deserializeUser(function(userId, done) {
  console.log("deserializing user");
  conn.query('SELECT * FROM users WHERE userId=$1', userId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      done(err, result.rows[0]);
    }
  })
})

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
conn.query('DROP TABLE IF EXISTS playlists');
conn.query('DROP TABLE IF EXISTS playlistsPosts');
conn.query('DROP TABLE IF EXISTS playlistsFollowers');


conn.query('CREATE TABLE IF NOT EXISTS posts (postId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'userId INTEGER, title TEXT NOT NULL, genre TEXT NOT NULL, url TEXT NOT NULL UNIQUE, ' +
'imageUrl TEXT NOT NULL UNIQUE, fileName TEXT NOT NULL, fileExtension TEXT NOT NULL, ' +
'original INTEGER, views INTEGER, likes INTEGER, reposts INTEGER, comments INTEGER, ' +
'description TEXT, dateTime DATETIME)');

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

conn.query('CREATE TABLE IF NOT EXISTS postTags (postId INTEGER, tagId INTEGER)');

conn.query('CREATE TABLE IF NOT EXISTS reposts (postId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS likes (postId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS views (postId INTEGER, userId INTEGER, viewCount INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'userId INTEGER, name TEXT, public BOOLEAN, likes INTEGER, reposts INTEGER, followers INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistId INTEGER, postId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

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


var insertQuery = ["jbin", "Jennifer Bin", "Shanghai, China", 1450, 288, 2, "yuh", 'profile_images/jbin-2.jpg'];
var insertSQL = 'INSERT INTO users (username, profileName, location, followers, following, numPosts, description, profile_image_src)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records succesfully added");
    }
  });

insertQuery = [1, "Shanghai", "Techwear", "localhost3000/jbin/shanghai", "/images/image-1527760266767.jpg", "image-1527760266767.jpg", "jpg", 1, 840, 120, 44, 21, "Jbin in Shanghai", "2018-05-30 17:07:30"];
insertSQL = 'INSERT INTO posts (userId, title, genre, url, imageUrl, fileName, fileExtension, original, views, likes, reposts, comments, description, dateTime)' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

conn.query(insertSQL, insertQuery, function(err, result) {
    if (err) {
      /*TODO: Handle Error*/
      console.log(err);
    } else {
      console.log("Records succesfully added");
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
        console.log("Records succesfully added");
      }
    });

  conn.query('INSERT INTO postTags (tagId, postId) VALUES (?, ?)', [1, 1], function(err, result) {
      if (err) {
        /*TODO: Handle Error*/
        console.log(err);
      } else {
        console.log("Records succesfully added");
      }
    });


app.get('/api/home', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/home');
  console.log("req is", req.user);

  var cookie_userId = req.session;
  conn.query('SELECT postId, userId, title, genre, url, imageUrl, original, views, ' +
    'likes, reposts, comments, description, dateTime FROM posts', function(err, result) {
    if (err) {
      console.log(err)
    } else {
      var postIds = [];
      var userIds = [];
      var question_query = '';
      for(var row in result.rows) {
        question_query += '?,';
        postIds.push(result.rows[row].postId);
        userIds.push(result.rows[row].userId);
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getUserDetailsFromPost(userIds, question_query), getTagDetailsFromPost(postIds, question_query)])
        .then(function(allData) {
          var posts = compilePosts(allData[0], allData[1], result);
          res.send(posts);
        }).catch(e => {
          console.log(e);
        })
      }
    });
  });

app.get('/api/:profile', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/profile');
  var username = req.params.profile;
  conn.query('SELECT userId, profileName, followers, following, location, profile_image_src, numPosts FROM users WHERE username=$1', username, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result.rows[0];
      var userDetails = {userId: row.userId, username: username,
        profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description};

        conn.query('SELECT postId, title, genre, url, imageUrl, original, views, likes, ' +
          'reposts, comments, description, dateTime FROM posts WHERE userId=$1', row.userId, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              var postIds = [];
              var question_query = '';
              for(var row in result.rows) {
                question_query += '?,';
                postIds.push(result.rows[row].postId);
              }
              question_query = question_query.slice(0, -1);
              Promise.all([getTagDetailsFromPost(postIds, question_query)])
                .then(function(allData) {
                  var posts = [];
                  for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    posts.push({postId:row.postId, views:row.views, likes:row.likes,
                      reposts:row.reposts, comments:row.comments, img_src:row.imageUrl,
                      title:row.title, genre:row.genre, description:row.description,
                      date:row.dateTime, original: row.original, user:userDetails,
                      tags:allData[0].filter(function(data) {return data.postId == row.postId})[0].tags});
                  }
                  var response = {userDetails: userDetails, posts: posts};
                  res.send(response);
                }).catch(e => {
                  console.log(e);
              })
            }
          })
        }
      })
});

app.get('api/:profile/info', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile + '/info');
  var username = req.params.profile;
  conn.query('SELECT userId, profileName, followers, following, location, profile_image_src, numPosts FROM users WHERE username=$1', username, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result.rows[0];
      res.send({userId: row.userId, username: username,
        profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description});
      }
  })
});

app.get('/api/:profile/:postId', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/:profile/:postId');
  var username = request.params.profile;
  var postId = request.params.postId;
})

app.post('/api/upload', function(request, response) {
  console.log('- Request received:', request.method.cyan, '/api/upload');
  var cookie_userId = request.session.userId;
  console.log(cookie_userId);
  upload(request, response, function(err) {
    if (err) {
      response.send({message: err.message})
      console.log(err);
    } else {
      var insertQuery = [1, request.body.title, request.body.genre, '/jbin/'+request.body.title, '/images/'+ request.file.filename,
        request.file.filename, 'jpg', request.body.original, 0, 0, 0, 0, request.body.description, Date.now()];
      conn.query('INSERT INTO posts (userId, title, genre, url, imageUrl, fileName, fileExtension, ' +
      'original, views, likes, reposts, comments, description, dateTime)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            Promise.all([postTagsFromUpload(result.lastInsertId, JSON.parse(request.body.inputTags))])
            .then(function(allData) {
              console.log("Records added succesfully");
              response.send({message: 'Post Uploaded Successfully!'})
            }).catch(e => {
              console.log(e);
          })
        }
      })
    }
  })
});

app.get('/api/images/:image_url', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/images/:image_url');
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
  console.log(req.user);
  res.redirect('/');
});

app.listen(8081, function(){
    console.log('- Server listening on port 8081');
});

function getUserDetailsFromPost(userIds, question_query) {
  return new Promise(function(resolve, reject) {
      conn.query('SELECT userId, username, profileName, profile_image_src FROM users WHERE userId IN (' + question_query + ')',
        userIds, function(err, result) {
        if (err) {
          return reject(err);
        } else {
          var users = [];
          for(var row in result.rows) {
            users.push({userId: result.rows[row].userId, username: result.rows[row].username,
              profileName: result.rows[row].profileName, profile_image_src: result.rows[row].profile_image_src})
          }
          return resolve(users);
        }
      });
    })
}

function getTagDetailsFromPost(postIds, question_query) {
  return new Promise(function(resolve, reject) {
    var response = [];
    for (let i = 0; i < postIds.length; i++) {
      conn.query('SELECT tagId FROM postTags WHERE postId=$1',
        postIds[i], function(err, result) {
        if (err) {
          return reject(err);
        } else {
          var tagIds = [];
          question_query = '';
          for (var row in result.rows) {
            question_query += '?,';
            tagIds.push(result.rows[row].tagId);
          }
          question_query = question_query.slice(0, -1);
          conn.query('SELECT itemType, itemBrand, itemName, original FROM tags WHERE tagId IN (' + question_query + ')',
            tagIds, function(err, result) {
            if (err) {
              return reject(err);
            } else {
              var tags = []
              for(var row in result.rows) {
                tags.push({itemType: result.rows[row].itemType, itemBrand: result.rows[row].itemBrand,
                  itemName: result.rows[row].itemName, original: result.rows[row].original})
              }
              response.push({postId: postIds[i], tags: tags});

              if (i == postIds.length - 1) {
                return resolve(response);
              }
            }
          })
        }
      })
    }
  });
}

function postTagsFromUpload(postId, inputTags) {
  return new Promise(function(resolve, reject) {
    for (let i = 0; i < inputTags.length; i++) {
      var insertQuery = [];
      insertQuery[0] = inputTags[i].itemType;
      insertQuery[1] = inputTags[i].itemName;
      insertQuery[2] = inputTags[i].itemBrand;
      insertQuery[3] = inputTags[i].original;

      conn.query('INSERT INTO tags (itemType, itemName, itemBrand, original) VALUES (?, ?, ?, ?)', insertQuery, function(err, result) {
        if (err) {
          return reject(err)
        } else {
          var tagId = result.lastInsertId;
          conn.query('INSERT INTO postTags (postId, tagId) VALUES (?, ?)', [postId, tagId], function(err, result) {
            if (err) {
              return reject(err)
            } else {
              if (i == inputTags.length - 1) {
                return resolve({message: 'success'});
              }
            }
          })
        }
      })
    }
  })
}

function compilePosts(userDetails, tagDetails, result) {
  var posts = [];
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    posts.push({postId:row.postId, views:row.views, likes:row.likes,
      reposts:row.reposts, comments:row.comments, img_src:row.imageUrl,
      title:row.title, genre:row.genre, description:row.description,
      date:row.dateTime, original: row.original,
      user:userDetails.filter(function(data) {return data.userId == row.userId})[0],
      tags:tagDetails.filter(function(data) {return data.postId == row.postId})[0].tags});
  }
  return posts;
}

function authenticationMiddleware () {
  return function (request, response, next) {
    if (request.isAuthenticated()) {
      return next()
    }
    response.redirect('/')
  }
}
