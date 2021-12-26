"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const knex_1 = __importDefault(require("knex"));
const redis_1 = require("redis");
const crypto_1 = __importDefault(require("crypto"));
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Successfully connected to redis"));
(async () => {
    await client.connect();
})();
const knex = knex_1.default;
class AuthService {
    async create(newUser) {
        const salt = await bcrypt_1.default.genSalt();
        const passwordHash = await bcrypt_1.default.hash(newUser.password, salt);
        await knex("users").insert({
            ...newUser,
            password: passwordHash,
        });
    }
    async delete(email) {
        await knex("users").where({ email }).delete();
    }
    async checkPassword(email, password) {
        const dbUser = await knex("users").where({ email }).first();
        if (!dbUser) {
            return false;
        }
        return bcrypt_1.default.compare(password, dbUser.password);
    }
    async login(email, password) {
        const correctPassword = await this.checkPassword(email, password);
        if (correctPassword) {
            const sessionId = crypto_1.default.randomUUID();
            await client.set(sessionId, email, { EX: 60 });
            return sessionId;
        }
        return undefined;
    }
    async getUserEmailForSession(sessionId) {
        return client.get(sessionId);
    }
}
exports.default = AuthService;
