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

import https from "https";

const app = express();
const port = process.env.PORT || 5000;

const knex = knexDriver(config);
const tripService = new TripService(knex);

const authService = new AuthService();

const redisPass = "hlzu8VsbpKUSe9GysuZDJQN73rDhipVy";

const client = createClient({
  // url: process.env.REDIS_URL,
  // no_ready_check: true,
  // auth_pass: redisPass,
});

client.on("error", (err) => console.log("Redis client error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

const getAsync = promisify(client.get).bind(client);
const setExAsync = promisify(client.setex).bind(client);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true, // (default)
    validateResponses: false, // false by default
  })
);

const checkLogin = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const session = req.cookies.session;
  console.log("checkLogin()-session: " + session);

  if (!session) {
    res.status(401);
    return res.json({
      message: "You need to be logged in to see this page. Err1",
    });
  }
  // console.log("checkLogin()-req.userEmail: "+req.userEmail);
  let email: string | null;
  if (session != null) {
    email = await getAsync(session);
  } else email = null;
  console.log("checkLogin()-email: "+email);

  if (req.params.tripID) {
    var mailToCheck = await authService.getUserOfTrip(req.params.tripId);
    if (mailToCheck !== email) {
      return res.json({
        message: "You need to be logged in to see this page. Err2",
      });
    }
  }

  if (!email) {
    res.status(401);
    return res.json({
      message: "You need to be logged in to see this page. Err3",
    });
  }

  console.log("checkLogin() session: " + session);
  console.log("checkLogin() email: " + email);
  next();
};

app.use(
  (err: HttpError, 
    req: Request, 
    res: Response, 
    next: NextFunction
    ) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

///////////////////////////////////////////// TRIPS //////////////////////////////

app.post("/trips", checkLogin, (req, res) => {
  const payload = req.body;
  getUserID(req).then(async (result: string | null | undefined) => {
    const user = result!;
    tripService.add(payload, user).then((newEntry) => res.json(newEntry));
  });
});

//UserID = email
async function getUserID(req) {
  const session = await authService.getUserEmailForSession(req.cookies.session);
  if (session) {
    return session;
  }
  return undefined;
}

app.get("/trips", checkLogin, async (req, res) => {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:5000');
  await getUserID(req).then((result: string | null | undefined) => {
    tripService
      .getTripsOfOneUser(result!)
      .then((savedTrips) => res.json(savedTrips));
  });
});

app.delete("/trips/:tripId", checkLogin, (req, res) => {
  const tripId = req.params.tripId;

  tripService.delete(tripId).then(() => {
    res.status(204);
    res.send();
  });
});

app.patch("/trips/:tripId", checkLogin, (req, res) => {
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
  console.log("post-login-sessionID: " + sessionId);
  if (!sessionId) {
    res.status(401);
    return res.json({ message: "Bad email or password" });
  }
   res.cookie("session", sessionId,{
     maxAge: 60*60*100000,
     httpOnly: true,
     sameSite: "none",
     secure: true,
     //  secure: process.env.NODE_ENV === "production",
   });
  res.status(200);
  return res.json({ status: "200", sessionID: sessionId });
});

app.post("/logout", async (req, res) => {
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
