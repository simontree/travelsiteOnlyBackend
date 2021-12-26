"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
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
async function seed(knex) {
    return knex("user1trips")
        .del()
        .then(() => {
        return knex("user1trips").insert(user1trips);
    });
}
exports.seed = seed;
