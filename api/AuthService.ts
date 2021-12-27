import config from "../knexfile";
import bcrypt, { compare } from "bcrypt";
import Knex from "knex";

import { createClient } from "redis";
import crypto from "crypto";

const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

(async () => {
  await client.connect();
})();

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
    console.log("check pw: " + password + ", " + dbUser.password);
    return bcrypt.compare(password, dbUser.password);
    // return dbUser.password === password;
  }

  public async login(
    email: string,
    password: string
  ): Promise<string | undefined> {
    const correctPassword = await this.checkPassword(email, password);
    console.log("correct pw?: " + correctPassword);
    if (correctPassword) {
      const sessionId = crypto.randomUUID();
      await client.set(sessionId, email, { EX: 600000000 }).
      then(() => console.log("Redis Cookie Set For: " + client.get(sessionId)));
      //console.log("Cookie Set For: " + email);
      
      return sessionId;
    }
    return undefined;
  }

  public async getUserEmailForSession(
    sessionId: string
  ): Promise<string | null> {
    return client.get(sessionId);
  }

  async getUsers(): Promise<User[]> {
    const users = await knex("user");
    return users;
  }
}

export default AuthService;
