import * as crypto from "crypto";
import { Knex } from "knex";

interface Trip {
  name: string;
  start: Date;
  end: Date;
  country: string;
  user_id: string;
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
  async add(trip: Trip, email: string): Promise<SavedTrips> {
    const newTrip: SavedTrips = {
      ...trip,
      user_id: email,
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
