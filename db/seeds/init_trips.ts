import { Knex } from "knex";

///////////// ONLY FOR TESTING PURPOSE /////////////////////

const trip = [
  {
    trip_id: "4f2b7664-5ea9-11ec-bf63-0242ac130002",
    name: "Urlaub auf Hawaii",
    start: "2022-10-10",
    end: "2022-10-21",
    country: "Hawaii",
    user_id: "1",
  },
  {
    trip_id: "68ba8278-5ea9-11ec-bf63-0242ac130002",
    name: "Partywochenende auf Ibiza",
    start: "2022-11-12",
    end: "2022-11-26",
    country: "Ibiza",
    user_id: "2",
  },
];

export async function seed(knex: Knex): Promise<void> {
  return knex("trip")
    .del()
    .then(function () {
      return knex("trip").insert(trip);
    });
}
