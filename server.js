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

conn.query('CREATE TABLE IF NOT EXISTS reposts (mediaId INTEGER, source TEXT, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS likes (mediaId INTEGER, source TEXT, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS views (mediaId INTEGER, userId INTEGER, IP_Address TEXT, viewCount INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlists (playlistId INTEGER PRIMARY KEY AUTOINCREMENT, ' +
'userId INTEGER, title TEXT, genre TEXT, public BOOLEAN, likes INTEGER, reposts INTEGER, comments INTEGER, ' +
'followers INTEGER, description TEXT, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsPosts (playlistId INTEGER, mediaId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsFollowers (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistsReposts (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

conn.query('CREATE TABLE IF NOT EXISTS playlistLikes (playlistId INTEGER, userId INTEGER, dateTime DATETIME)');

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

conn.query('INSERT INTO following (followingId, userId) VALUES (?, ?)', [2, 1], function(err, result) {
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
    conn.query('SELECT followingId FROM following WHERE userId=$1', userId, function(err, result) {
      if (err) {
        return reject(err)
      }
      else {
        var userIds = [];
        var question_query = '';
        for (var i = 0; i < result.rows.length; i++) {
          userIds.push(result.rows[i].followingId)
          question_query += '$'+ (i+1) + ',';
        }
        userIds.push(userId);
        question_query += ('$' + (result.rows.length + 1));
        Promise.all([getStreamRevisedV2(userIds, question_query)])
        .then(function(allData) {
          res.send(allData[0])
        }).catch(err => {
          console.log(err);
        })
      }
    })
  }
})

app.post('/api/like', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/like');
  var userId = req.user;
  var mediaId = req.body.mediaId;
  conn.query('INSERT INTO likes (mediaId, source, userId, dateTime) VALUES (?,?,?,?)',
    [mediaId, 'posts', userId, Date.now()], function(err, result) {
      if (err) {
        console.log(err);
        res.send({message: "fail"})
      } else {
        conn.query('UPDATE posts SET likes = likes + 1 WHERE mediaId=$1', mediaId, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log("Liked post successfully");
            res.send({message: "success"})
          }
        })
      }
    })
})

app.post('/api/repost', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/repost');
  var userId = req.user;
  var mediaId = req.body.mediaId;
  conn.query('INSERT INTO reposts (mediaId, userId, dateTime) VALUES (?,?,?)',
    [mediaId, userId, Date.now()], function(err, result) {
      if (err) {
        console.log(err);
        res.send({message: "fail"})
      } else {
        conn.query('UPDATE posts SET reposts = reposts + 1 WHERE mediaId=$1', mediaId, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log("Reposted post successfully");
            res.send({message: "success"})
          }
        })
      }
    })
})

app.get('/api/you/collections/likes', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/likes');
  var userId = req.user;
  conn.query('SELECT a.*, b.dateTime AS likeTime FROM posts AS a, likes AS b WHERE ' +
  'a.mediaId = b.mediaId AND b.userId=$1 ORDER BY likeTime DESC', userId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var userIds = []
      var question_query = ''
      for (var i = 0; i < result.rows.length; i++) {
        userIds.push(result.rows[i].userId)
        question_query += "?,"
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getUserDetails(userIds, question_query)])
      .then(function(allData) {
        res.send(compileLikes(allData[0], result))
      }).catch(err => {
        console.log(err);
      })
    }
  })
})

app.get('/api/you/collections/playlists', function(req, res) {
  console.log('- Request received:', req.method.cyan, '/api/you/collections/playlists');
  var userId = req.user;
  conn.query('SELECT playlistId, userId, dateTime FROM playlistsLikes WHERE userId=$1 ORDER BY dateTime DESC', userId, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var playlistIds = []
      var sources = []
      var question_query = '';
      for (var i = 0; i < result.rows.length; i++) {
        mediaIds.push(result.rows[i].playlistId);
        sources.push('playlists')
        question_query += '?,';
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getPlaylists(playlistIds, sources, question_query)])
        .then(function(allData) {
          res.send({playlists: allData[0]});
        }).catch(err => {
          console.log(err);
        })
    }
  })
})

app.get('/api/:profile', (req, res) => {
  console.log('- Request received:', req.method.cyan, '/api/' + req.params.profile);
  var username = req.params.profile;
  var userId = req.user;

  conn.query('SELECT userId, profileName, followers, following, location, profile_image_src, numPosts FROM users WHERE username=$1',
  username, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      var row = result.rows[0];
      var userDetails = {userId: row.userId, username: username,
        profileName: row.profileName, profile_image_src: row.profile_image_src,
        followers: row.followers, following: row.following, location: row.location,
        numPosts: row.numPosts, description: row.description};

      if (row.userId == userId) {
        console.log("cookie User is same as selected User");
      }

      Promise.all([getStreamRevisedV2(row.userId, '$1')])
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
      var insertQuery = [userId, request.body.title, request.body.genre, '/jbin/'+request.body.title, '/images/'+ request.file.filename,
        request.file.filename, 'jpg', request.body.original, 0, 0, 0, 0, request.body.description, Date.now()];
      conn.query('INSERT INTO posts (userId, title, genre, url, imageUrl, fileName, fileExtension, ' +
      'original, views, likes, reposts, comments, description, dateTime)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', insertQuery, function(err, result) {
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
//     conn.query('SELECT mediaId, tagId FROM postTags WHERE mediaId IN (' + question_query + ') ORDER BY tagId ASC',
//     mediaIds, function(err, result) {
//       if (err) {
//         return reject(err);
//       } else {
//         var tagPosts = {};
//         var tagIds = [];
//         question_query = '';
//         if (result.rows.length > 0) {
//           var currentTagId = result.rows[0].tagId;
//           tagIds.push(currentTagId);
//           tagPosts[currentTagId] = [];
//           question_query += '?,';
//           for (var i = 0; i < result.rows.length; i++) {
//             var row = result.rows[i];
//             var tagId = row.tagId;
//             if (currentTagId != tagId) {
//               question_query += '?,';
//               tagIds.push(tagId);
//               tagPosts[tagId] = [];
//               tagPosts[tagId].push(row.mediaId);
//               currentTagId = tagId
//             } else {
//               tagPosts[currentTagId].push(row.mediaId);
//             }
//           }
//           question_query = question_query.slice(0, -1);
//         }
//         conn.query('SELECT * FROM tags WHERE tagId IN (' + question_query + ') ORDER BY tagId ASC',
//           tagIds, function(err, result) {
//           if (err) {
//             return reject(err);
//           } else {
//             var postTags = {};
//             for(i = 0; i < result.rows.length; i++) {
//               for (var j = 0; j < tagPosts[result.rows[i].tagId].length; j++) {
//                 var mediaId = tagPosts[result.rows[i].tagId][j];
//                 if (postTags[mediaId]) {
//                   postTags[mediaId].push({itemType: result.rows[i].itemType, itemBrand: result.rows[i].itemBrand,
//                     itemName: result.rows[i].itemName, original: result.rows[i].original})
//                 } else {
//                   postTags[mediaId] = [];
//                   postTags[mediaId].push({itemType: result.rows[i].itemType, itemBrand: result.rows[i].itemBrand,
//                     itemName: result.rows[i].itemName, original: result.rows[i].original})
//                 }
//               }
//             }
//             return resolve(postTags);
//           }
//         })
//       }
//     })
//   })
// }

// function getPostsFromPlaylists(playlistIds, question_query) {
//   return new Promise(function(resolve, reject) {
//     conn.query('SELECT playlistId, mediaId, dateTime FROM playlistsPosts WHERE playlistId IN (' + question_query + ') ORDER BY dateTime DESC',
//     playlistIds, function(err, result) {
//       if (err) {
//         return reject(err)
//       } else {
//         return resolve(getPostsFromPlaylistsHelper(result))
//       }
//     })
//   });
// }

function getPlaylistsPosts(playlistIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT a.*, b.playlistId as playlistId FROM posts AS a, playlistsPosts AS b ' +
    'WHERE a.mediaId = b.mediaId AND b.playlistId IN (SELECT playlistId FROM playlistsPosts ' +
    'WHERE playlistId IN (' + question_query + '))', playlistIds, function(err, result) {
      var userIds = []
      var mediaIds = []
      question_query = ''
      for (var i = 0; i < result.rows.length; i++) {
        userIds.push(result.rows[i].userId)
        mediaIds.push(result.rows[i].mediaId)
        question_query += '?,'
      }
      question_query = question_query.slice(0, -1);
      Promise.all([getUserDetails(userIds, question_query), getTagDetails(mediaIds, question_query)])
      .then(function(allData) {
        var playlistsPosts = {}
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i]
          var playlistId = row.playlistId
          var post = {mediaId:row.mediaId, playlistId: playlistId, views:row.views, likes:row.likes,
            reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
            title:row.title, genre:row.genre, description:row.description,
            date:row.dateTime, original: row.original, user:allData[0][row.userId],
            tags:allData[1][row.mediaId], dateTime: row.dateTime}

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
//     var mediaIds = []
//     var sources = []
//     var question_query = ''
//     var orderByClause = ''
//     for (var i = 0; i < result.rows.length; i++) {
//       orderByClause += 'WHEN ' + result.rows[i].mediaId + ' THEN ' + (i+1) + ' '
//       mediaIds.push(result.rows[i].mediaId)
//       sources.push('posts')
//       question_query += '?,'
//     }
//     orderByClause += 'end'
//     question_query = question_query.slice(0, -1);
//     conn.query('SELECT mediaId, userId, title, genre, url, imageUrl, original, views, ' +
//       'likes, reposts, comments, description, dateTime FROM posts WHERE mediaId IN (' + question_query + ') ORDER BY CASE mediaId ' + orderByClause,
//       mediaIds, function(err, result2) {
//         if (err) {
//           return reject(err)
//         }
//         var userIds = [];
//         var question_query = '';
//         for(var row in result2.rows) {
//           question_query += '?,';
//           userIds.push(result2.rows[row].userId);
//         }
//         question_query = question_query.slice(0, -1);
//         Promise.all([getUserDetails(userIds, question_query), getTagDetails(mediaIds, question_query)])
//           .then(function(allData) {
//             var posts = compilePosts(allData[0], allData[1], result2, sources)
//             var playlistsPosts = {}
//             for (var i = 0; i < result.rows.length; i++) {
//               var row = result.rows[i]
//               if (playlistsPosts[row.playlistId]) {
//                 playlistsPosts[row.playlistId].push(posts[i])
//               } else {
//                 playlistsPosts[row.playlistId] = []
//                 playlistsPosts[row.playlistId].push(posts[i])
//               }
//             }
//             return resolve(playlistsPosts)
//           }).catch(err => {
//             return reject(err)
//           })
//       })
//   })
// }

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

function compilePosts(userDetails, tagDetails, result, sources) {
  var posts = [];
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    posts.push({mediaId:row.mediaId, views:row.views, likes:row.likes,
      reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
      title:row.title, genre:row.genre, description:row.description,
      date:row.dateTime, original: row.original, user:userDetails[row.userId],
      tags:tagDetails[row.mediaId], dateTime: row.dateTime, source: sources[i]});
  }
  return posts;
}

function compileLikes(userDetails, result) {
  var posts = [];
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    posts.push({mediaId:row.mediaId, views:row.views, likes:row.likes,
      reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
      title:row.title, genre:row.genre, description:row.description,
      date:row.dateTime, original: row.original, user:userDetails[row.userId],
      uploadDate: row.dateTime, likeDate: row.likeDate});
  }
  return posts;
}

function revisedCompilePosts(userDetails, tagDetails, result) {
  var posts = [];
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    posts.push({mediaId:row.mediaId, views:row.views, likes:row.likes,
      reposts:row.reposts, comments:row.comments, post_image_src:row.imageUrl,
      title:row.title, genre:row.genre, description:row.description,
      date:row.dateTime, original: row.original, user:userDetails[row.userId],
      tags:tagDetails[row.mediaId], uploadDate: row.dateTime, reposter: userDetails[row.reposter],
      repostDate: row.orderTime, likeDate: row.likeDate});
  }
  return posts;
}

function compilePlaylists(userDetails, playlistsPosts, result, sources) {
  var playlists = [];
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    playlists.push({playlistId:row.mediaId, likes:row.likes, reposts:row.reposts,
      comments:row.comments, followers: row.followers, title:row.title, genre:row.genre,
      description:row.description, dateTime:row.dateTime, public: row.public,
      user:userDetails[row.userId], source: sources[i], posts: playlistsPosts[row.mediaId]});
  }
  return playlists;
}

// function getPosts(mediaIds, sources, question_query) {
//   return new Promise(function(resolve, reject) {
//     var orderByClause = ''
//     for (var i = 0; i < mediaIds.length; i++) {
//       orderByClause += 'WHEN ' + mediaIds[i] + ' THEN ' + (i+1) + ' '
//     }
//     orderByClause += 'end'
//     conn.query('SELECT mediaId, userId, title, genre, url, imageUrl, original, views, ' +
//       'likes, reposts, comments, description, dateTime FROM posts WHERE mediaId IN (' + question_query + ') ORDER BY CASE mediaId ' + orderByClause,
//       mediaIds, function(err, result) {
//       if (err) {
//         return reject(err)
//       } else {
//         var userIds = [];
//         var user_question_query = '';
//         for(var row in result.rows) {
//           user_question_query += '?,';
//           userIds.push(result.rows[row].userId);
//         }
//         user_question_query = user_question_query.slice(0, -1);
//         Promise.all([getUserDetails(userIds, user_question_query), getTagDetails(mediaIds, question_query)])
//           .then(function(allData) {
//             return resolve(compilePosts(allData[0], allData[1], result, sources));
//           }).catch(err => {
//             return reject(err);
//           })
//         }
//       });
//   })
// }

// function getPlaylists(playlistIds, sources, question_query) {
//   return new Promise(function(resolve, reject) {
//     if (playlistIds.length == 0) {
//       return resolve([])
//     } else {
//       var orderByClause = ''
//       for (var i = 0; i < playlistIds.length; i++) {
//         orderByClause += 'WHEN ' + playlistIds[i] + ' THEN ' + (i+1) + ' '
//       }
//       orderByClause += 'end'
//       conn.query('SELECT mediaId, userId, title, public, likes, reposts, comments, followers, description, dateTime FROM playlists ' +
//       'WHERE mediaId IN (' + question_query + ') ORDER BY CASE mediaId ' + orderByClause, playlistIds, function(err, result) {
//         if (err) {
//           return reject(err)
//         } else {
//           var userIds = [];
//           var user_question_query = '';
//           for(var row in result.rows) {
//             user_question_query += '?,';
//             userIds.push(result.rows[row].userId);
//           }
//           user_question_query = user_question_query.slice(0, -1);
//           Promise.all([getUserDetails(userIds, user_question_query), getPostsFromPlaylists(playlistIds, question_query)])
//             .then(function(allData) {
//               return resolve(compilePlaylists(allData[0], allData[1], result, sources))
//             }).catch(err => {
//               return reject(err)
//             })
//         }
//       });
//     }
//   })
// }

// function getStream(userIds, question_query) {
//   return new Promise(function(resolve, reject) {
//     conn.query('SELECT mediaId, dateTime, \'posts\' AS source FROM posts WHERE userId IN (' + question_query + ') UNION ALL ' +
//     'SELECT mediaId, dateTime, \'reposts\' AS source FROM reposts WHERE userId IN (' + question_query + ') UNION ALL ' +
//     'SELECT mediaId, dateTime, \'playlists\' AS source FROM playlists WHERE userId IN (' + question_query + ') UNION ALL ' +
//     'SELECT mediaId, dateTime, \'playlistsReposts\' AS source FROM playlistsReposts WHERE userId IN (' + question_query + ') ORDER BY dateTime DESC LIMIT 20',
//     userIds, function(err, result) {
//       if (err) {
//         return reject(err)
//       } else {
//         var mediaIds = [];
//         var mediaSources = [];
//         var media_question_query = '';
//         var playlistIds = [];
//         var playlistSources = [];
//         var playlist_question_query = '';
//         for (var i = 0; i < result.rows.length; i++) {
//           var source = result.rows[i].source
//           if (source == 'playlists' || source == 'playlistsReposts') {
//             playlistIds.push(result.rows[i].mediaId)
//             playlistSources.push(source)
//             playlist_question_query += '?,'
//           } else {
//             mediaIds.push(result.rows[i].mediaId)
//             mediaSources.push(source)
//             media_question_query += '?,';
//           }
//         }
//         media_question_query = media_question_query.slice(0, -1);
//         playlist_question_query = playlist_question_query.slice(0, -1);
//         Promise.all([getPosts(mediaIds, mediaSources, media_question_query),
//           getPlaylists(playlistIds, playlistSources, playlist_question_query)])
//           .then(function(allData) {
//             return resolve({posts: allData[0], playlists: allData[1]});
//           }).catch(err => {
//             return reject(err)
//           })
//       }
//     })
//   })
// }

// function getStreamRevised(userIds, question_query) {
//   return new Promise(function(resolve, reject) {
//     conn.query('SELECT a.*, b.dateTime AS orderTime, b.userId AS reposter FROM posts ' +
//     'AS a, reposts AS b WHERE a.mediaId = b.mediaId AND b.userId IN (' + question_query + ') UNION ALL ' +
//     'SELECT *, dateTime AS orderTime, null AS reposter FROM posts WHERE userId IN(' + question_query + ') ORDER BY orderTime DESC LIMIT 20',
//     userIds, function(err, result) {
//       if (err) {
//         return reject(err)
//       } else {
//         var mediaIds = []
//         var userIds = []
//         var media_question_query = ''
//         var user_question_query = ''
//         for (var i = 0; i < result.rows.length; i++) {
//           userIds.push(result.rows[i].reposter, result.rows[i].userId)
//           user_question_query += '?,?,'
//           mediaIds.push(result.rows[i].mediaId)
//           media_question_query += '?,'
//         }
//         user_question_query = user_question_query.slice(0, -1)
//         media_question_query = media_question_query.slice(0, -1);
//         Promise.all([getUserDetails(userIds, user_question_query), getTagDetails(mediaIds, media_question_query)])
//         .then(function(allData) {
//           return resolve({posts: revisedCompilePosts(allData[0], allData[1], result)})
//         }).catch(err => {
//           return reject(err)
//         })
//       }
//     })
//   });
// }

function getStreamRevisedV2(userIds, question_query) {
  return new Promise(function(resolve, reject) {
    conn.query(
    'SELECT null as mediaId, a.playlistId, a.userId, a.title, a.genre, a.public, null as original, null as imageUrl, null AS views, a.likes, a.reposts, a.comments, a.followers, a.description, a.dateTime, b.dateTime as orderTime, b.userId as reposter ' +
    'FROM playlists AS a, playlistsReposts AS b WHERE a.playlistId = b.playlistId AND b.userId IN (' + question_query + ') UNION ALL ' +
    'SELECT null as mediaId, playlistId, userId, title, genre, public, null as original, null as imageUrl, null AS views, likes, reposts, comments, followers, description, dateTime, dateTime as orderTime, null as reposter ' +
    'FROM playlists WHERE userId IN (' + question_query + ') UNION ALL ' +
    'SELECT a.mediaId, null as playlistId, a.userId, a.title, a.genre, a.public, a.original, a.imageUrl, a.views, a.likes, a.reposts, a.comments, null as followers, a.description, a.dateTime, b.dateTime as orderTime, b.userId as reposter ' +
    'FROM posts AS a, reposts AS b WHERE a.mediaId = b.mediaId AND b.userId IN (' + question_query + ') UNION ALL ' +
    'SELECT mediaId, null as playlistId, userId, title, genre, public, original, imageUrl, views, likes, reposts, comments, null as followers, description, dateTime, dateTime as orderTime, null as reposter ' +
    'FROM posts WHERE userId IN (' + question_query + ') ORDER BY orderTime DESC LIMIT 20',
    userIds, function(err,result) {
      console.log(result);
      if (err) {
        console.log("heererererere");
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
          getPlaylistsPosts(playlistIds, media_question_query)])
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
                tags:allData[1][row.mediaId], uploadDate: row.dateTime, reposter: allData[0][row.reposter],
                repostDate: row.orderTime}
              stream.push(post)
            } else if (playlistId) {
              var playlist = {playlistId:row.playlistId, likes:row.likes, reposts:row.reposts,
                genre: row.genre, comments:row.comments, followers: row.followers, title:row.title,
                description:row.description, uploadDate:row.dateTime, public: row.public,
                reposter: allData[0][row.reposter], repostDate: row.orderTime,
                user:allData[0][row.userId], posts: allData[2][row.playlistId]}
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
