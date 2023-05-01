/** Database config for database. */


const { Client } = require("pg");
let db;

if (process.env.NODE_ENV === "test") {
  db = new Client({
    host: "/var/run/postgresql/",
    database: "books_test"
  });
} else {
  db = new Client({
    host: "/var/run/postgresql/",
    database: "books"
  });
}



db.connect();


module.exports = db;
