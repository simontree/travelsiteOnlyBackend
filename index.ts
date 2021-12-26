import express, { NextFunction, Request, Response } from "express";

import TripService from "./api/TripService";
import AuthService from "./api/AuthService";
import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";

import { knex as knexDriver } from "knex";
import cors from "cors";

import config from "./knexfile";

import { createClient } from "redis";

const app = express();
const port = process.env.PORT || 5000;

const knex = knexDriver(config);
const tripService = new TripService(knex);

const authService = new AuthService(knex);

const client = createClient();

client.on("error", (err) => console.log("Redis client error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

(async () => {
  await client.connect();
})();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cors());

app.use(express.json());

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: false, // false by default
  })
);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

///////////////////////////////////////////// TRIPS //////////////////////////////

app.post("/trips", (req, res) => {
  //client.set("a","4");
  const payload = req.body;
  tripService.add(payload).then((newEntry) => res.json(newEntry));
});

app.get("/trips", (req, res) => {
  //console.log(client.get("a"));
  tripService.getAll().then((savedTrips) => res.json(savedTrips));
});

app.delete("/trips/:tripId", (req, res) => {
  //client.del("a");
  const tripId = req.params.tripId;
  tripService.delete(tripId).then(() => {
    res.status(204);
    res.send();
  });
});

app.patch("/trips/:tripId", (req, res) => {
  const tripId = req.params.tripId;
  const changes = req.body;

  tripService.update(tripId, changes).then(() => {
    res.status(200);
    res.send();
  });
});

///////////////////////////////////////////// USERS //////////////////////////////

app.post("/user", (req, res) => {
  const payload = req.body;
  authService.create(payload).then((newEntry) => res.json(newEntry));
});

app.post("/login", async (req, res) => {
  const payload = req.body;
  console.log(payload);
  const sessionId = await authService.login(payload.email, payload.password);
  if (!sessionId) {
    res.status(401);
    return res.json({ message: "Bad email or password" });
  }
  /*res.cookie("session", sessionId, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });*/
  res.status(200);
  return res.json({ status: "200", sessionID: sessionId });
});

app.post("/trips/:userIDtrips", (req, res) => {
  // const userIDtrips = req.params.userIDtrips;
  const payload = req.body;
  tripService.add(payload).then((newEntry) => res.json(newEntry));
});

app.get("/trips/:userIDtrips", (req, res) => {
  // const userIDtrips = req.params.userIDtrips;
  tripService.getAll().then((savedTrips) => res.json(savedTrips));
});

app.delete("/trips/:userIDtrips/:tripId", (req, res) => {
  // const userIDtrips = req.params.userIDtrips;
  const tripId = req.params.tripId;
  tripService.delete(tripId).then(() => {
    res.status(204);
    res.send();
  });
});

app.put("/trips/:userIDtrips/:tripId", (req, res) => {
  // const userIDtrips = req.params.userIDtrips;
  const tripId = req.params.tripId;
  const changes = req.body;

  tripService.update(tripId, changes).then(() => {
    res.status(200);
    res.send();
  });
});

///////////////////////////////////////////// END USERS //////////////////////////

////////////////////////////////////////// FOR DEBUG /////////////////////////////

app.get("/get", (req, res ) =>{
  /*return res.json({
    chicken: "hi"
  })*/
  authService.getUsers().then((dbUsers) => res.json(dbUsers));
});


//////////////////////////////////////////// END DEBUG ///////////////////////////

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
