import { Knex } from "knex";

const user2trips = [
  {
    trip_id: "4f2b7664-5ea9-11ec-bf63-0242ac130002",
    name: "Skifahren in den Alpen",
    start: "2022-10-10",
    end: "2022-10-21",
    country: "Germany",
  },
  {
    trip_id: "68ba8278-5ea9-11ec-bf63-0242ac130002",
    name: "Surfen in der Algarve",
    start: "2022-11-12",
    end: "2022-11-26",
    country: "Portugal",
  },
];

export async function seed(knex: Knex): Promise<void> {
  return knex("user2trips")
    .del()
    .then(() => {
      return knex("user2trips").insert(user2trips);
    });
}
