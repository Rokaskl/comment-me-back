// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Comments (id INTEGER PRIMARY KEY AUTOINCREMENT, comment TEXT, url TEXT)"
    );
    console.log("New table Comments created!");

    // insert default comment
    db.serialize(() => {
      db.run(
        'INSERT INTO Comments (comment,url) VALUES ("Testing on Google.com","www.google.com"), ("One more test","www.google.com""), ("Last test, I promise","www.google.com"")'
      );
    });
  } else {
    console.log('Database "Comments" ready to go!');
    db.each("SELECT * from Comments", (err, row) => {
      if (row) {
        console.log(`record: ${row.comment}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all the comments in the database
app.get("/getComments", (request, response) => {
  db.all("SELECT * from Comments", (err, rows) => {
    response.send(JSON.stringify(rows));
  });
});

// endpoint to get  comments on certain url.
app.get("/getCommentsByURL", (request, response) => {
  //response.send(request.query);
  console.log(`Get request from : ${request.query.url}`)
  db.all(
    `SELECT * from Comments where Comments.url like '%${request.query.url}%'`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
    }
  );
});

// endpoint to add a comment to the database
app.post("/addComment", (request, response) => {
  console.log(`add comment ${request.body.comment} for ${request.body.url}`);

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    const cleansedComment = cleanseString(request.body.comment);
    const cleansedUrl = cleanseString(request.body.url);

    db.run(
      `INSERT INTO Comments (comment,url) VALUES (?,?)`,
      cleansedComment,
      cleansedUrl,
      error => {
        if (error) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

// endpoint to clear comments from the database
app.get("/clearComments", (request, response) => {
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Comments",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Comments WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
