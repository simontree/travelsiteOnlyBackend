"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//this file is not in use any more - just use the knexfile.ts at the moment
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const knex_1 = __importDefault(require("knex"));
const dbEnvironment = process.env.NODE_ENV || "development";
const config = require("../knexfile.ts")[dbEnvironment];
exports.default = (0, knex_1.default)(config);
