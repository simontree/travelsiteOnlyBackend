import { Knex } from "knex";

const user1trips = [
  {
    trip_id: "4f2b7664-5ea9-11ec-bf63-0242ac130002",
    name: "Urlaub auf Haiti",
    start: "2022-10-10",
    end: "2022-10-21",
    country: "Haiti",
  },
  {
    trip_id: "68ba8278-5ea9-11ec-bf63-0242ac130002",
    name: "Partywoche in Indien",
    start: "2022-11-12",
    end: "2022-11-26",
    country: "India",
  },
];

export async function seed(knex: Knex): Promise<void> {
  return knex("user1trips")
    .del()
    .then(() => {
      return knex("user1trips").insert(user1trips);
    });
}
