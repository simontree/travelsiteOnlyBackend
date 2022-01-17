///////////////////////  LOCAL DEV  ////////////////////////
 import dotenv from "dotenv";
 dotenv.config();
////////////////////////////////////////////////////////////

import { Knex } from "knex";

import pg from "pg";
import * as moment from "moment"; //date-format library
pg.types.setTypeParser(1082, (str) => moment.utc(str).format("YYYY-MM-DD"));

const config: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false } // allow self-signed certificate for Heroku/AWS
        : false, // if we run locally, we don't want SSL at all
  },
  migrations: {
    directory: "./db/migrations",
  },
  seeds: {
    directory: "./db/seeds",
  },
};

export default config;
