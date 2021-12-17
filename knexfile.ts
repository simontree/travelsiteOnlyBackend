import dotenv from "dotenv";
dotenv.config();

import { Knex } from "knex";

const devConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: "./db/migrations",
  },
  seeds: {
    directory: "./db/seeds",
  },
};

const prodConfig: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false } // allow self-signed certificate for Heroku/AWS
        : false, // if we run locally, we don't want SSL at all
  },
  migrations: {
    directory: "./build/db/migrations",
  },
  seeds: {
    directory: "./build/db/seeds",
  },
};

export default devConfig;
