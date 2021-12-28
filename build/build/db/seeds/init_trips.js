"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
///////////// ONLY FOR TESTING PURPOSE /////////////////////
const trip = [
    {
        trip_id: "4f2b7664-5ea9-11ec-bf63-0242ac130002",
        name: "Urlaub auf Hawaii",
        start: "2022-10-10",
        end: "2022-10-21",
        country: "Hawaii",
        user_id: "huehne@htw-berlin.de",
    },
    {
        trip_id: "68ba8278-5ea9-11ec-bf63-0242ac130002",
        name: "Partywochenende auf Ibiza",
        start: "2022-11-12",
        end: "2022-11-26",
        country: "Ibiza",
        user_id: "sebastian@giggle.com",
    },
];
async function seed(knex) {
    return knex("trip")
        .del()
        .then(function () {
        return knex("trip").insert(trip);
    });
}
exports.seed = seed;
