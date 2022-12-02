const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');

// db config
const dbConfig = {
  host: "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+): 
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.json());

app.use(express.static('Resources'));

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const user = {
  user_id: undefined,
  username: undefined,
  password: undefined,
  user_bio: undefined,
  user_city: undefined,
  photoid: undefined,
  first_log: "true",
}

app.get('/', (req,res) => //Homepage
{
  res.render("pages/login");
}) 

app.get('/login', (req,res) => //Load Login page
{
  res.render("pages/login");
})

app.post('/login', async (req,res) =>
{
  const query = `SELECT * FROM Users WHERE username = $1`;

  db.one(query, [
    req.body.username
  ]
  )
    .then(async (data) =>{
      var match = await bcrypt.compare(req.body.password, data.password);
      var fl = user.first_log;

      if(match && fl == "true")
      {
        user.user_id = data.user_id;
        user.username = data.username;
        user.password = data.password;
        user.photoid = data.photoid;
        user.user_bio = data.user_bio;
        user.user_city = data.user_city;
        user.first_log = "false"

        req.session.user = user;
        req.session.save();
        console.log("This will work when /my_courses is real");
        console.log(user.user_id);
        res.redirect('/updateProfile')
      }
      else if (match)
      {
        user.user_id = data.user_id;
        user.username = data.username;
        user.password = data.password;
        user.photoid = data.photoid;
        user.user_bio = data.user_bio;
        user.user_city = data.user_city;

        req.session.user = user;
        req.session.save();
        console.log("This will work when /my_courses is real");
        console.log(user.user_id);
        res.redirect('/displayUserProfile')
      }
      else
      {
        console.log("Incorrect username or password.");
        res.render('pages/login', {
        
          error: true,
          message: "Incorrect Username or Password", //just added this message send to the login.ejs page so the error is displayed loginErrorBranch
          });
      }
    })
    .catch((err)=>{
      console.log("/login post error")      
      console.log(err);
      res.render('pages/login', {//felt like it was appropriate to redirect to the login page if there was an error.  Oscar 35
        
        error: true,
        message: "User not found", //just added this message send to the login.ejs page so the error is displayed loginErrorBranch
        });

    });
})

app.get('/register', (req,res) => //Register
{
  res.render('pages/register');
})

app.post('/register', async (req,res) =>
{   
  //check if username already exists
    //taken care of by UNIQUE keyword in the CREATE.SQL

  //make sure username/password is input
    //taken care of in the Register.ejs page, can submit without the two forms filled out

  //check if password is long enough
  if (req.body.password.length < 5) {
    res.render('pages/register', {
      error: true,
      message: "password must be longer than 5 characters",
    }) 
  }
    //hash the password and store it in the db
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO Users (username, password) values ($1, $2) returning *;';
    await db.any(query, [req.body.username,hash])
    //if successful, then redirect to updateProfile page
    .then(function (data) {
      //const username assigned if successful
      user.username = req.body.username;
      //TODO: insert standard photo for photoid
      user.photoid = "";
      user.user_bio = "";
      user.user_city = "";
      user.first_log = "true";
      req.session.user = user;
      req.session.save();
        res.redirect('/login');
        
    })
    //if not successful, reload register page and print the error at the top
    .catch(function (err) {
      console.log(err);
        res.render('pages/register', {
        
        error: true,
        message: err.message,
        });
    })
})

//Reliant on const user throughout session. Const values set for user in login
app.get('/displayUserProfile',(req,res)=>
{
  
  res.render("pages/myProfile",{
    
    username: req.session.user.username,
    photoid: req.session.user.photoid,
    user_bio: req.session.user.user_bio,
    user_city: req.session.user.user_city,
  });
});

app.get('/displayUserProfile/:username',(req,res)=>
{
  const query = `SELECT username, photoid, user_bio, user_city FROM Users WHERE username = $1;`;
  const username = req.params.username;

  db.any(query, [username])
  .then(function(user) {
    res.render('pages/userProfile',{user});
  });
});

app.get('/updateProfile',(req,res)=>
{
  res.render("pages/updateProfile",{
    username: req.session.user.username,
    photoid: req.session.user.photoid,
    user_bio: req.session.user.user_bio,
    user_city: req.session.user.user_city,
  }); //This will open ejs page
});

app.post('/updateProfile', async (req,res)=>
{
  const username= req.session.user.username;
  const photoid= req.session.user.photoid;
  const user_bio=req.body.user_bio;
  const user_city=req.body.user_city;
  //fix here Where username = ?
  const query = `UPDATE Users SET photoid=$2, user_bio=$3, user_city=$4 WHERE username=$1`;
  await db.any(query,[username, photoid, user_bio, user_city])
    .then(function (data) {
      user.photoid=req.body.photoid;
      user.user_city=req.body.user_city;
      user.user_bio=req.body.user_bio;
      req.session.user = user;
      req.session.save();
      res.redirect("/displayUserProfile");
        })
    .catch(function (err) {
        console.log(err);
        res.redirect("/login");
    });
});


app.post('/addtrail', async (req,res) =>
{
    const user_id = req.session.user.user_id;

    const query = "INSERT INTO User_Routes(user_id, route_id) VALUES ($1, $2);"

    db.any(query, [req.session.user.user_id, req.body.route_id])
    .then((data) => {
      /*res.status(201).json({
        status: 'success',
        data: data,
        message: 'data added successfully',
      }); */
      res.redirect('/findTrails');
    })
    .catch(function (err) {
      return console.log(err);
    });

});

app.post('/deletetrail', async (req,res) => {
  var query = 'DELETE FROM User_Routes WHERE user_id = $1 AND route_id = $2;'

  db.any(query, [req.session.user.user_id, req.body.route_id])
    .then((data) => {
      res.redirect('/myTrails');
    })
    .catch(function (err) {
      return console.log(err);
    });

});

app.post('/addfriend', (req,res) =>
{
    
})

app.get('/findTrails', (req,res) =>
{ /*SELECT route_name, route_city, rating FROM ((User_Routes RIGHT JOIN Users ON User_routes.user_id = Users.user_id) LEFT JOIN Routes ON User_routes.route_id = Routes.route_id);*/

var name = req.body.nameIn;
var city = req.body.cityIn;
var qRating = req.body.ratingIn;
var queryChanged = false;

var query = `SELECT * 
              FROM routes 
              WHERE route_id NOT IN 
              (
              SELECT route_id
              FROM User_Routes
              WHERE user_id = $1
              );`; 

  /*if(name != ""){
    query += (` AND route_name = '` + name + `' `);
  }

  if(city != "")
  {
    query += (` AND route_city = '` + city + `' `);
  }

  if(qRating != "")
  {
    query += (` AND rating = '` + qRating + `' `);
  }

  query += ` ;`;*/

  console.log("query is : " + query);

    db.any(query, [req.session.user.user_id])
      .then((routes) => {
        res.render("pages/findTrails", {routes});
      })
      .catch((err) => {
        res.render("pages/findTrails", {
          routes: [],
          error: true,
          message: err.message,
        });
      });
      //adding something to re commit
})

app.get('/myTrails', (req,res) => {
   //only get trails that aling with req.session.user.iser_id in User_Routes
  var query = `SELECT * 
               FROM routes 
               WHERE route_id IN 
               (
                SELECT route_id
                FROM User_Routes
                WHERE user_id = $1
               )
               ;`; 
  //var query = `SELECT * FROM User_Routes ;`;


  db.any(query, [req.session.user.user_id])
  .then((routes) => {
    res.render("pages/myTrails", {routes});
  })
  .catch((err) => {
    res.render("pages/myTrails", {
      routes: [],
      error: true,
      message: err.message,
    });
  });


})

app.get('/myfriends', (req,res) =>
{
    var query = `SELECT DISTINCT users.user_id, users.username, users.user_city, users.user_bio 
                 FROM users
                 INNER JOIN friends friend1
                  ON friend1.user_id_1 = $1
                  INNER JOIN friends friend2
                  ON friend2.user_id_2 = $1
                  WHERE users.user_id = friend1.user_id_2 
                  OR 
                  users.user_id = friend2.user_id_1;`
    db.any(query, [req.session.user.user_id])
      .then((userfriends) => {
        console.log("The user id for this session is " + req.session.user.user_id);
        console.log(userfriends);
        res.render("pages/my_friends", {data: userfriends}); 
      })
      .catch((err) => {
        res.render("pages/my_friends", {
          users: [],
          error: true,
          message: err.message,
        });
      });
})

app.get('/findfriends', (req,res) =>
{
    var query = `SELECT users.user_id, users.username, users.user_city, users.user_bio FROM Users WHERE users.user_id != $1;`; // AND 

    db.any(query, [req.session.user.user_id])
    .then((users) => {
      res.render('pages/findFriends', {users});
    })
    .catch((err) => {
      res.render('pages/findFriends', {
        users: [],
        error: true,
        message: err.message
      });
    });
})

app.get('/messages', (req,res) =>
{

})

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render('pages/login', {
    message: "Logged out successfully.",
  }) 
});

app.listen(3000);
console.log("Server is listening on port 3000");
