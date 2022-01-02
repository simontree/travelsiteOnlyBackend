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
  //no_ready_check: true,
  //auth_pass: redisPass,
});
//const client = createClient();

client.on("error", (err) => console.log("Redis client error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

 (async () => {
   await client.connect();
 })();

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

const checkLogin = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
  ) => {

   const session = req.cookies.session;
  if (!session) {
    res.status(401);
    return res.json({
      message: "You need to be logged in to see this page. Err1",
    });
  }

  let email: string | null;
  if (session != null) {
    // email = await client.get(session.toString());
    email = await getAsync(session);
  } else email = null;

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

  console.log("check session: " + session);
  console.log("check email: " + email);
  next();
};

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

///////////////////////////////////////////// TRIPS //////////////////////////////

app.post("/trips", checkLogin, (req, res) => {
  const payload = req.body;
  getUserID().then(async (result: string | null | undefined) => {
    const user = result!;
    tripService.add(payload, user).then((newEntry) => res.json(newEntry));
  });
});

async function getUserID() {
  // const session = await client.get("cookie");
  const session = "a";
  if (session) {
    // const userID = await client.get(session);
    const userID = await getAsync(session.toString());
    return userID;
  }
  return undefined;
}

app.get("/trips"/*, checkLogin*/, (req, res) => {
  const payload = req.body;
  /*getUserID(userID).then((result: string | null | undefined) => {
    tripService
      .getTripsOfOneUser(result!)
      .then((savedTrips) => res.json(savedTrips));
  });*/
  const email:string = JSON.parse(payload).email;
  console.log(email);
  tripService.getTripsOfOneUser(email)
      .then((savedTrips) => res.json(savedTrips));
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
  console.log("sessionID: " + sessionId);
  if (!sessionId) {
    res.status(401);
    return res.json({ message: "Bad email or password" });
  }
   res.cookie(payload.email, sessionId, {
     maxAge: 60 * 60 * 1000,
     httpOnly: true,
     sameSite: "none",
     secure: process.env.NODE_ENV === "development",
   });
  res.status(200);
  // client.set("cookie", sessionId, { EX: 600 });
  //await setExAsync("cookie", 60 * 60, sessionId);
  return res.json({ status: "200", sessionID: sessionId });
});

app.post("/logout", async (req, res) => {
  // client.set("cookie", "0");
  //await setExAsync("cookie", 60 * 60, "0");
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
