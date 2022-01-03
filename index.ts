import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import TripService from "./api/TripService";
import AuthService from "./api/AuthService";
import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";

import { knex as knexDriver } from "knex";
import cors from "cors";

import config from "./knexfile";

import { createClient } from "redis";

import { promisify } from "util";

const app = express();
const port = process.env.PORT || 5000;

const knex = knexDriver(config);
const tripService = new TripService(knex);

const authService = new AuthService();

const redisPass = "hlzu8VsbpKUSe9GysuZDJQN73rDhipVy";

const client = createClient({
  url: process.env.REDIS_URL,
  no_ready_check: true,
  auth_pass: redisPass,
});
//const client = createClient();

client.on("error", (err) => console.log("Redis client error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

const getAsync = promisify(client.get).bind(client);
const setExAsync = promisify(client.set).bind(client);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: false, // false by default
  })
);
async function checkLogin(user_id:string){
  getAsync(JSON.stringify(user_id));


};


app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

///////////////////////////////////////////// TRIPS //////////////////////////////

app.post("/trips", (req, res) => {
  const payload = {
    name: JSON.stringify(req.body.name),
    start: req.body.start,
    end: req.body.end,
    country: JSON.stringify(req.body.country),
    user_id: JSON.stringify(req.body.email),
  }
  console.log(payload);
  const email:string = JSON.stringify(req.body.email);
  const checkRedis = new Promise((resolve, reject) => {
    resolve(getAsync(email));
  });
  checkRedis.then(((value) => {
    if(value != null){
      tripService.add(payload, email).then((newEntry) => res.json(newEntry));
    }else{
      res.status(401);
      return res.json({
      message: "You need to be logged in to see this page. Err3",
      });
    }
  }))
});

//Get Trips of one user
app.post("/trips/:email", (req, res) => {
  //console.log("Trips Retrival Begun: " + JSON.stringify(req.body.email));
  //const payload = req.body;
  /*getUserID(userID).then((result: string | null | undefined) => {
    tripService
      .getTripsOfOneUser(result!)
      .then((savedTrips) => res.json(savedTrips));
  });*/
  const email:string = JSON.stringify(req.body.email);
  const checkRedis = new Promise((resolve, reject) => {
    resolve(getAsync(email));
  });
  checkRedis.then(((value) => {
    if(value != null){
      console.log(value);
      tripService.getTripsOfOneUser(email)
      .then((savedTrips) => {
      console.log(savedTrips);
      res.json(savedTrips)});
    }else{
      res.status(401);
      return res.json({
      message: "You need to be logged in to see this page. Err3",
      });
    }
  }))
  //console.log(email);
});

app.delete("/trips/:tripId",  (req, res) => {
  const tripId = req.params.tripId;

  tripService.delete(tripId).then(() => {
    res.status(204);
    res.send();
  });
});

app.post("/trips/:tripId", (req, res) => {
  const tripId = req.params.tripId;
  const changes = JSON.stringify({
    name: JSON.stringify(req.body.name),
    start: req.body.start,
    end: req.body.end,
    country: JSON.stringify(req.body.country),
  });
  console.log("CHANGES: ------------------" + changes + "---------------------");
  const email:string = JSON.stringify(req.body.email);
  const checkRedis = new Promise((resolve, reject) => {
    resolve(getAsync(email));
  });
  checkRedis.then(((value) => {
    if(value != null){
      tripService.update(tripId, changes).then(() => {
        res.status(200);
        res.send();
      });
    }else{
      res.status(401);
      return res.json({
      message: "You need to be logged in to see this page. Err update",
      });
    }
  }))
});

///////////////////////////////////////////// USERS //////////////////////////////

app.post("/user", (req, res) => {
  const payload = req.body;
  authService.create(payload).then((newEntry) => res.json(newEntry));
});

app.get("/user", (req, res) => {
  authService.getUsers().then((savedUsers) => res.json(savedUsers));
});

app.delete("/user/:email", (req, res) => {
  const email = req.params.email;
  authService.delete(email).then(() => {
    res.status(204);
    res.send();
  });
});

app.post("/login", async (req, res) => {
  const payload = req.body;
  const sessionId = await authService.login(payload.email, payload.password);
  console.log("sessionID: " + sessionId);
  if (!sessionId) {
    res.status(401);
    return res.json({ message: "Bad email or password" });
  }

  res.status(200);
  await setExAsync( sessionId, JSON.stringify(payload.email));
  client.expire(JSON.stringify(payload.email), 35);
  return res.json({ status: "200", sessionID: sessionId });
});

app.post("/logout", async (req, res) => {;
  console.log("logout");
  res.status(200);
  return res.json({ message: "Logout successful" });
});

///////////////////////////////////////////// END USERS //////////////////////////

////////////////////////////////////////// FOR DEBUG /////////////////////////////

// app.get("/get", (req, res) => {
//   /*return res.json({
//     chicken: "hi"
//   })*/
//   authService.getUsers().then((dbUsers) => res.json(dbUsers));
// });

//////////////////////////////////////////// END DEBUG ///////////////////////////

app.listen(port, () => {
  console.log(`Test app listening at http://localhost:${port}`);
});
