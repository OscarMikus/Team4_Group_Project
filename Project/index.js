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
  username: undefined,
  user_bio: undefined,
  user_city: undefined,
};

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

      if(match)
      {
        
        user.username = data.username;
        user.user_bio = data.user_bio;
        user.user_city = data.user_city;
        req.session.user = {
          api_key: process.env.API_KEY,
        };
        req.session.save();
        console.log("This will work when /my_courses is real");
        res.redirect('/displayUserProfile')
      }
      else
      {
        console.log("Incorrect username or password.");
        res.render('pages/login')
      }
    })
    .catch((err)=>{
      console.log("/login post error")      
      console.log(err);
      res.redirect('/login') //felt like it was appropriate to redirect to the login page if there was an error.  Oscar 35

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
    //if successful, then redirect to login page
    .then(function (data) {
        res.redirect('/login')
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
    user_bio: req.session.user.user_bio,
    user_city: req.session.user.user_city,
  });
});

app.get('/updateProfile',(req,res)=>
{
  res.render("/pages/updateProfile"); //This will call other API route
});

app.post('/updateProfile',(req,res)=>
{
  const originalUsername= req.session.user.username;
  const username=req.body.username;
  const user_bio=req.body.user_bio;
  const user_city=req.body.user_city;
  const query = "UPDATE Users SET username = $2, user_bio=$3, user_city=$4 WHERE username=$1";
  db.any(query,[username])
    .then((Users)=>{
        req.session.user.username=username;
        req.session.user.user_bio=user_bio;
        req.session.user.user_city=user_city;
        res.redirect("/displayUserProfile");
    })
    .catch((err)=>{
        console.log(err);
        res.redirect("/login");
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post('/addtrail', (req,res) =>
{
    
})
app.post('/addfriend', (req,res) =>
{
    
})

app.get('/findtrails', (req,res) =>
{
    
})

app.get('/findfriends', (req,res) =>
{
    
})

app.get('/messages', (req,res) =>
{

})
app.listen(3000);
console.log("Server is listening on port 3000");