//this file is not in use any more - just use the knexfile.ts at the moment
import dotenv from "dotenv";
dotenv.config();

import Knex from "knex";
const dbEnvironment = process.env.NODE_ENV || "development";

const config = require("../knexfile.ts")[dbEnvironment];

export default Knex(config);
