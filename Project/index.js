const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');
const axios = require('axios');

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

app.get('/', (req,res) => //Homepage
{
  res.render("pages/test");
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
        req.session.user = {
          api_key: process.env.API_KEY,
        };
        req.session.save();
        console.log("This will work when /my_courses is real");
        res.redirect('/my_courses')
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
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO Users (username, password) values ($1, $2) returning *;';
    await db.any(query, [
        req.body.username,
        hash
    ])
    .then(function (data) {
        res.redirect('/login')
    })
    .catch(function (err) {
        console.log(err);
        res.redirect('/register')
    })
})

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