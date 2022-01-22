"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knexfile_1 = __importDefault(require("../knexfile"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const knex_1 = __importDefault(require("knex"));
const redis_1 = require("redis");
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const redisPass = "hlzu8VsbpKUSe9GysuZDJQN73rDhipVy";
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    no_ready_check: true,
    auth_pass: redisPass,
});
//const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Successfully connected to redis"));
// (async () => {
//   await client.connect();
// })();
const getAsync = (0, util_1.promisify)(client.get).bind(client);
const setExAsync = (0, util_1.promisify)(client.setex).bind(client);
const knex = (0, knex_1.default)(knexfile_1.default);
class AuthService {
    async create(newUser) {
        const salt = await bcrypt_1.default.genSalt();
        const passwordHash = await bcrypt_1.default.hash(newUser.password, salt);
        await knex("user").insert({
            ...newUser,
            password: passwordHash,
        });
    }
    async delete(email) {
        await knex("user").where({ email }).delete();
    }
    async checkPassword(email, password) {
        const dbUser = await knex("user").where({ email }).first();
        if (!dbUser) {
            return false;
        }
        // console.log("check pw: " + password + ", " + dbUser.password);
        return bcrypt_1.default.compare(password, dbUser.password);
    }
    async login(email, password) {
        const correctPassword = await this.checkPassword(email, password);
        console.log("correct pw?: " + correctPassword);
        if (correctPassword) {
            const sessionId = crypto_1.default.randomUUID();
            // await client
            //   .set(sessionId, email, { EX: 600 })
            //   .then(async () =>
            //     console.log("Redis Cookie Set For: " + (await client.get(sessionId)))
            //   );
            //STUCK HERE; PROBLEM WITH REDIS
            await setExAsync(sessionId, 60 * 60, email);
            return sessionId;
        }
        return undefined;
    }
    async getUserOfTrip(uuid) {
        return (await knex("trip").where({ trip_id: uuid }).select("user_id")).toString();
    }
    async getUserEmailForSession(sessionId) {
        // return client.get(sessionId);
        return getAsync(sessionId);
    }
    async getUsers() {
        const users = await knex("user");
        return users;
    }
}
exports.default = AuthService;
