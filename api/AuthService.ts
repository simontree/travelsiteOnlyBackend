import config from "../knexfile";
import bcrypt, { compare } from "bcrypt";
import Knex from "knex";

import { createClient } from "redis";
import crypto from "crypto";

import { promisify } from "util";
const redisPass = "hlzu8VsbpKUSe9GysuZDJQN73rDhipVy";

const client = createClient({
  url: process.env.REDIS_URL,
  //no_ready_check: true,
  //auth_pass: redisPass,
});
//const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

 //(async () => {
 //  await client.connect();
 //})();

const getAsync = promisify(client.get).bind(client);
const setExAsync = promisify(client.set).bind(client);

const knex = Knex(config);

interface User {
  email: string;
  password: string;
}

class AuthService {
  async create(newUser: User): Promise<void> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newUser.password, salt);
    await knex("user").insert({
      ...newUser,
      password: passwordHash,
    });
  }

  async delete(email: string): Promise<void> {
    await knex("user").where({ email }).delete();
  }

  async checkPassword(email: string, password: string): Promise<boolean> {
    const dbUser = await knex<User>("user").where({ email }).first();
    if (!dbUser) {
      return false;
    }
    // console.log("check pw: " + password + ", " + dbUser.password);
    return bcrypt.compare(password, dbUser.password);
  }

  public async login(
    email: string,
    password: string
  ): Promise<string | undefined> {
    const correctPassword = await this.checkPassword(email, password);
    console.log("correct pw?: " + correctPassword);
    if (correctPassword) {
      const sessionId = crypto.randomUUID();
      // await client
      //   .set(sessionId, email, { EX: 600 })
      //   .then(async () =>
      //     console.log("Redis Cookie Set For: " + (await client.get(sessionId)))
      //   );
      //STUCK HERE; PROBLEM WITH REDIS
      setExAsync(sessionId, email);
      console.log("AS 74");
      return sessionId;
    }
    return undefined;
  }

  async getUserOfTrip(uuid: string): Promise<string> {
    return (
      await knex("trip").where({ trip_id: uuid }).select("user_id")
    ).toString();
  }

  public async getUserEmailForSession(
    sessionId: string
  ): Promise<string | null> {
    // return client.get(sessionId);
    return getAsync(sessionId);
  }

  async getUsers(): Promise<User[]> {
    const users = await knex("user");
    return users;
  }
}

export default AuthService;
