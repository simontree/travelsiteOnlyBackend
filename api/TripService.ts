import * as crypto from "crypto";
// const db = require("../db/db-config"); //import db-config und connection zu knex und pg - old js syntax
import { Knex } from "knex";

interface Trip {
  name: string;
  start: Date;
  end: Date;
  country: string;
}

interface SavedTrips extends Trip {
  trip_id: string;
}

class TripService {
  trips: SavedTrips[] = [];
  private knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }
  async add(trip: Trip): Promise<SavedTrips> {
    const newTrip: SavedTrips = {
      ...trip,
      trip_id: crypto.randomUUID(),
    };
    await this.knex("trip").insert(newTrip);
    console.log("cool");
    return newTrip;
  }

  async getAll(): Promise<SavedTrips[]> {
    return this.knex("trip");
  }

  async getTripsOfOneUser(email: string): Promise<SavedTrips[]> {
    return this.knex("trip").where({ user_id: email });
  }

  async delete(uuid: string): Promise<void> {
    await this.knex("trip").where({ trip_id: uuid }).delete();
  }

  async update(uuid: string, changes: string): Promise<void> {
    await this.knex("trip").where({ trip_id: uuid }).update(changes);
  }
}

export default TripService;
