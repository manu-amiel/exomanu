const express = require('express');
const app = express();
const httpMsgs = require('http-msgs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/assets', express.static('public'));
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
const sqlite3 = require("sqlite3").verbose();
const db_name = ("exomanu.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connexion réussie à la base de données 'exomanu.db'");
});
app.listen(3000, () => {
  console.log('running on port 3000')
});
///////////////////////////////// création des tables///////////////////////////////////////////////////////////
const sql_create_users = `

CREATE TABLE IF NOT EXISTS Users (
    Id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    Name_user VARCHAR(100) NOT NULL,
    Firstname VARCHAR(100) NOT NULL,
    Birthdate DATE NOT NULL,
    Genre VARCHAR(100) NOT NULL
  )`;

const sql_create_genres = `

CREATE TABLE IF NOT EXISTS Genres (
    Id_genre INTEGER PRIMARY KEY AUTOINCREMENT,
    Name_genre VARCHAR(100) NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(Id_user)
      ON DELETE CASCADE
  )`;

const sql_create_albums = `

CREATE TABLE IF NOT EXISTS Albums (
    Id_album INTEGER PRIMARY KEY AUTOINCREMENT,
    Name_album VARCHAR(100) NOT NULL,
    genre_id INTEGER,
    FOREIGN KEY (genre_id) REFERENCES Genres(Id_genre)
    ON DELETE CASCADE
  )`;

db.run(sql_create_users, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Création réussie de la table 'Users'");
});

db.run(sql_create_genres, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Création réussie de la table 'Genres'");
});

db.run(sql_create_albums, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Création réussie de la table 'Albums'");
});
//////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", (request, response) => response.render('index', {}));

// GET GENRES
app.get("/ajax_genre", (request, response) => {
  console.log(request.query.id_genre)
  const user_id = request.query.id_genre;
  console.log(user_id);
  const sql_genres = `SELECT DISTINCT
    A.Id_album,
    A.genre_id,
    A.Name_album,
    G.user_id,
    G.Id_genre,
    G.Name_genre
    FROM Genres G
    LEFT JOIN Albums A ON A.genre_id = G.Id_genre
    WHERE user_id = ?`
  db.all(sql_genres, [user_id], (err, split) => {
    if (err) {

      return console.error(err.message);
    }

    response.json({ genres: split });


  });
});

/// GET ALBUMS
app.get("/ajax_album", (request, response) => {
  const genre_id = request.query.id_genre;
  console.log(genre_id + ' id_genre');
  const sql_genres = `SELECT DISTINCT
  A.Id_album,
  A.Name_album,
  A.genre_id
  FROM Albums A
  WHERE A.genre_id = ?`
  db.all(sql_genres, [genre_id], (err, split) => {
    if (err) {

      return console.error(err.message);

    }
    if (split !== undefined) {
      response.json({ albums: split });

    }

  });
});

// POST /add/genre
app.post('/add/genre', (request, response) => {
  console.log(request.body);
  const name_genre = request.body.Name_genre;
  const user_genre_id = request.body.user_id;
  const sql_insert = `INSERT INTO Genres (Name_genre, user_id) VALUES
  (?,?)`;
  db.run(sql_insert, [name_genre, user_genre_id], err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Alimentation réussie de la table 'Genres'");
    var data = request.body;
    console.log(data);
    response.json(data);

  });
});

// POST /add/album
app.post('/add/album', (request, response) => {
  console.log(request.body);
  const name_album = request.body.Name_genre;
  const genre_album_id = request.body.genre_id;
  const sql_insert = `INSERT INTO Albums (Name_album, genre_id) VALUES
  (?,?)`;
  db.run(sql_insert, [name_album, genre_album_id], err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Alimentation réussie de la table 'Albums'");
    var data = request.body;
    console.log(data);
    response.json(data);

  });
});

// GET /delete/genre
app.get("/delete/genre", (request, response) => {
  console.log(request.query);
  const id_genre = request.query.genre_id;
  console.log(id_genre);
  const sql = `DELETE FROM Genres WHERE Id_genre = ?`;
  db.run(sql, id_genre, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('suppresion genre ! ' + id_genre);
    var data = { 'status': 'ok' };
    console.log(data);
    response.json(data);
  });
});

// GET /delete/album
app.get("/delete/album", (request, response) => {
  console.log(request.query);
  const id_album = request.query.id_album;
  console.log(id_album);
  const sql = `DELETE FROM Albums WHERE Id_album = ?`;
  db.run(sql, id_album, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('suppresion album ! ' + id_album);
    var data = { 'status': 'ok' };
    console.log(data);
    response.json(data);
  });
});

/**
 * 
 * Contrôleurs des utilisateurs
 * 
 */

// GET recupération de tous les utilisateurs
app.get("/users", (request, response) => {
  const sql = `
  SELECT
    Id_user AS id,
    Name_user AS name,
    Firstname AS firstname,
    Birthdate AS birthdate,
    Genre AS gender
  FROM Users ORDER BY Id_user`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    response.json({ users: rows });
  });
});

// GET Récupère les données d'un utilisateur
app.get("/user", (request, response) => {
  const userId = request.query.id;
  const sql = `
    SELECT
      Id_user AS id,
      Name_user AS name,
      Firstname AS firstname,
      Birthdate AS birthdate,
      Genre AS gender
    FROM Users
    WHERE Id_user = ?`;

  db.get(sql, [userId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    response.json(row);
  });
});

// POST Ajoute un utilisateur
app.post('/user/add', (request, response) => {
  var values = request.body;
  const sql_insert = `INSERT INTO Users
    (Name_user, Firstname, Birthdate, Genre)
  VALUES
    (?,?,?,?)`;
  db.run(sql_insert,
      values.name,
      values.firstname,
      values.birthdate,
      values.gender, err => {
    if (err) {
      return console.error(err.message);
    }
    response.json({status: 'ok'});
  });
});

// POST Modifie un utilisateur
app.post("/user/edit", (request, response) => {
  var values = request.body;
  const sql = `
    UPDATE Users 
    SET 
      Name_user = ?,
      Firstname = ?,
      Birthdate = ?,
      Genre = ?
    WHERE
      Id_user = ?`;
  db.run(sql,
    values.name,
    values.firstname,
    values.birthdate,
    values.gender,
    values.id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    var data = { 'status': 'ok' };
    console.log(data);
    response.json(data);
  });
});

// POST Supprime un utilisateur
app.post("/user/delete", (request, response) => {
  const userId = request.body.id;
  const sql = `DELETE FROM Users WHERE Id_user = ?`;
  db.run(sql, userId, (err) => {
    if (err) {
      return console.error(err.message);
    }
    response.json({'status': 'ok' });
  });
});


