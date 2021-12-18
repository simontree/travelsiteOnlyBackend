import * as crypto from "crypto";
// const db = require("../db/db-config"); //import db-config und connection zu knex und pg - old js syntax
import { Knex } from "knex";
import moment from "moment"; //date-format library

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

  async delete(uuid: string): Promise<void> {
    await this.knex("trip").where({ trip_id: uuid }).delete();
  }

  // TODO need to implement
  // async udpate(uuid: string): Promise<data> {
  //   await this.knex("trip").where({ trip_id: uuid }).update(data);
  // }
}

export default TripService;
