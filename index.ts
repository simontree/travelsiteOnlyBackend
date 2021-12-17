import express, { NextFunction, Request, Response } from "express";

import TripService from "./api/TripService";
import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";

import { knex as knexDriver } from "knex";
import cors from "cors";
import config from "./knexfile";

const app = express();
const port = process.env.PORT || 5000;

const knex = knexDriver(config);
const tripService = new TripService(knex);

app.use(
  cors({
    origin: "*", //allow requests from any origin for now
  })
);

app.use(cors());

app.use(express.json());

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: false, // (default)
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

app.post("/trips", (req, res) => {
  const payload = req.body;
  tripService.add(payload).then((savedTrip) => res.json(savedTrip));
});

app.get("/trips", (req, res) => {
  tripService.getAll().then((savedTrips) => res.json(savedTrips));
});

app.delete("/trips/:tripId", (req, res) => {
  const tripId = req.params.tripId;
  tripService.delete(tripId).then(() => {
    res.status(204);
    res.send();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
