const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let dbConnectionObj = null;
app.use(express.json());

const initializeDBandServer = async () => {
  dbConnectionObj = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  app.listen(3000, () => {
    console.log("Server started at http://localhost:3000/");
  });
};

initializeDBandServer();

//API-1    GET list of all movie names
app.get("/movies/", async (Request, Response) => {
  const getMoviesQuery = `SELECT movie_name AS movieName FROM movie;`;
  const moviesList = await dbConnectionObj.all(getMoviesQuery);
  Response.send(moviesList);
});

//API-2 post a new movie details
app.post("/movies", async (Request, Response) => {
  const reqBody = Request.body;
  const { directorId, movieName, leadActor } = reqBody;

  const postMovieQuery = `INSERT INTO 
            movie(director_id,
                movie_name,
                lead_actor)VALUES(
                    ${directorId}, '${movieName}', '${leadActor}'
                );`;

  await dbConnectionObj.run(postMovieQuery);
  Response.send("Movie Successfully Added");
});

//API-3    GET specific movie
app.get("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const getMoviesQuery = `SELECT 
    movie_id AS movieId,
    director_id AS directorId,   
    movie_name AS movieName ,
    lead_actor AS leadActor
    FROM movie
    WHERE movie_id = ${movieId}
    ;`;
  const moviesList = await dbConnectionObj.get(getMoviesQuery);
  Response.send(moviesList);
});

//API-4 Update a particular movie

app.put("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const reqBody = Request.body;
  const { directorId, movieName, leadActor } = reqBody;

  const putMovieQuery = `UPDATE movie 
  SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await dbConnectionObj.run(putMovieQuery);
  Response.send("Movie Details Updated");
});

//DELETE a particular movie
app.delete("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await dbConnectionObj.run(deleteMovieQuery);
  Response.send("Movie Removed");
});

//API-6    GET list of all directors
app.get("/directors/", async (Request, Response) => {
  const getMoviesQuery = `SELECT 
  director_id AS directorId,
  director_name AS directorName FROM director ;`;
  const directorsList = await dbConnectionObj.all(getMoviesQuery);
  Response.send(directorsList);
});

//API-7 GET the movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (Request, Response) => {
  const { directorId } = Request.params;
  const getMoviesByDirectorQuery = `SELECT movie.movie_name AS movieName FROM director 
    INNER JOIN movie ON movie.director_id = director.director_id 
    WHERE movie.director_id = ${directorId}`;
  const moviesList = await dbConnectionObj.all(getMoviesByDirectorQuery);
  Response.send(moviesList);
});

module.exports = app;
