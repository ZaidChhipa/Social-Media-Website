const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 8087;
const User = require('./mongo');
const Post = require('./post');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
mongoose.connect("mongodb://127.0.0.1:27017/SocialMediaWeb",{
 
});
// .then(result => console.log("database connected"))
// .catch(err=>console.log(err));
// Listen for the connected event
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Listen for the error event
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Define a middleware function to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
  // Check if the user is logged in

  // Replace this condition with your own logic to check the login status
  const isLoggedIn = req.session.isLoggedIn; // Example: assuming you're using session-based authentication

  if (isLoggedIn) {
    // User is logged in, proceed to the next middleware or route handler
    next();
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/login');
  }
};
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.post('/login', (req, res) => {
  // Access the form data
  const loginname = req.body.loginname;
  const loginpass = req.body.loginpass;

  User.findOne({ username: loginname, password: loginpass })
    .then(user => {
      if (!user) {
        res.status(404).send('Invalid login credentials');
      } else {
        req.session.isLoggedIn = true;
        req.session.name = loginname;
        // Valid login credentials
        res.redirect('/');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
});

app.post('/updateprofile',(req,res)=>{

});

app.post('/register',(req, res)=>{
const fname = req.body.fname;
const username =  req.body.username;
const password = req.body.password;
const checkboxes = req.body.checkbox;
const email = req.body.email;

console.log("firstname : "+fname);
console.log("username : "+username);
console.log("password : "+password);
console.log("checkboxes : "+checkboxes);
console.log("email : "+email);

const newUser = new User({
  fname: fname,
  username: username,
  password: password,
  checkboxes: checkboxes,
  email: email
});

newUser.save()
  .then(() => {
    console.log('Data saved to MongoDB');
    res.sendFile(path.join(__dirname, '/landing.html'));
  })
  .catch((error) => {
    console.error('Error saving data to MongoDB:', error);
    res.status(500).send('An error occurred');
  });
});

app.post('/post', (req, res) => {
  // Access the form data
  const message = req.body.message;

  console.log("message : "+message);

  const newPost = new Post({
    message: message,
    createdBy: req.session.name,
    createdOn: new Date(),
  });

  newPost.save()
  .then(() => {
    console.log('Data saved to MongoDB');
    res.sendFile(path.join(__dirname, '/index.html'));
  })
  .catch((error) => {
    console.error('Error saving data to MongoDB:', error);
    res.status(500).send('An error occurred');
  });
});

app.get('/', checkLoggedIn, function (req, res) {
  const createdBy = req.session.name;
  const query = { createdBy: createdBy };

  Post.find({}, 'message createdBy')
    .then((posts) => {
      console.log('Retrieved posts:', posts);
      res.sendFile(path.join(__dirname, 'index.html'));
    })
    .catch((error) => {
      console.error('Error retrieving data from MongoDB:', error);
      res.status(500).send('An error occurred');
    });
});

app.get('/fetch-posts', checkLoggedIn, function (req, res) {
  const createdBy = req.session.name;
  const query = { createdBy: createdBy };

  Post.find({}, 'message createdBy')
    .then((posts) => {
      console.log('Retrieved posts:', posts);
      res.render('posts', { posts: posts }, function (err, renderedContent) {
        if (err) {
          console.error('Error rendering posts:', err);
          res.status(500).send('An error occurred');
        } else {
          res.send(renderedContent);
        }
      });
    })
    .catch((error) => {
      console.error('Error retrieving data from MongoDB:', error);
      res.status(500).send('An error occurred');
    });
});

app.get('/fetch-posts-timeline', checkLoggedIn, function (req, res) {
  const createdBy = req.session.name;
  const query = { createdBy: createdBy };

  Post.find(query, 'message createdBy')
    .then((posts) => {
      console.log('Retrieved posts:', posts);
      res.render('timelineposts', { posts: posts }, function (err, renderedContent) {
        if (err) {
          console.error('Error rendering posts:', err);
          res.status(500).send('An error occurred');
        } else {
          res.send(renderedContent);
        }
      });
    })
    .catch((error) => {
      console.error('Error retrieving data from MongoDB:', error);
      res.status(500).send('An error occurred');
    });
});




app.listen(3000, () => {
  console.log('Server is running on port 3000');
}); 
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      // Redirect to the login page or any other desired page
      res.redirect('/login');
    }
  });
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '/landing.html'));
});

app.get('/accountsettings', function(req, res) {
  res.sendFile(path.join(__dirname, '/edit-account-setting.html'));
});

app.get('/profile', function(req, res) {
  res.sendFile(path.join(__dirname, '/edit-profile-basic.html'));
});

app.get('/changepassword', function(req, res) {
  res.sendFile(path.join(__dirname, '/edit-password.html'));
});

app.get('/feed', function(req, res) {
  res.sendFile(path.join(__dirname, '/newsfeed.html'));
});

app.get('/logout', function(req, res) {
  res.sendFile(path.join(__dirname, '/logout.html'));
});

app.get('/notifications', function(req, res) {
  res.sendFile(path.join(__dirname, '/notifications.html'));
});

app.get('/timeline', function(req, res) {
  res.sendFile(path.join(__dirname, '/time-line.html'));
});

app.get('/friends', function(req, res) {
  res.sendFile(path.join(__dirname, '/friends-list.html'));
});

app.get('/photos', function(req, res) {
  res.sendFile(path.join(__dirname, '/images.html'));
});

app.get('/about', function(req, res) {
  res.sendFile(path.join(__dirname, '/about.html'));
});


app.use(express.static("public"));
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
    console.log("style file is found:  " + req.url);
  }
  next();
});

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    console.log("js file is found:  " + req.url);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.listen(port, function() {
  console.log('Server started at http://localhost:' + port);
});

app.post('/changepass', async (req, res) => {
  const sessionName = req.session.name; // Assuming the session name is stored in req.session.name
  const newPassword = req.body.newpass;

  try {
    // Find the user by session name
    const user = await User.findOne({ username: sessionName });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    return res.redirect('/changepassword');
  } catch (err) {
    console.error(err);
    return res.send('error : '+err);
  }
});

// app.get('/', checkLoggedIn, (req, res) => {
//   const createdBy = req.session.name;
//   const query = { createdBy: createdBy }; // Define the query object
// console.log("i am data from this view ");
//   Post.find(query, 'message createdBy')
//   .then((posts) => {
//     console.log('Retrieved posts:', posts);
//     res.render('posts', { posts: posts });
//   })
//   .catch((error) => {
//     console.error('Error retrieving data from MongoDB:', error);
//     res.status(500).send('An error occurred');
//   });
// });
