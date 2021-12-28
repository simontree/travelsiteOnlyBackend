"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const user = [
    {
        email: "huehne@htw-berlin.de",
        password: "$2y$10$O66J/G59rzFAgaPUeYCSZ.1LxHnGFYcnL.Cv./KUAm4YDwTKxIYOi",
    },
    {
        email: "superuser@yohoo.de",
        password: "$2y$10$AgTFjyWXmkdSVW.fBh8i4OxSKP/LCj6pdKJBZg2uNbjuyDNoKmaLG",
    },
];
async function seed(knex) {
    return knex("user")
        .del()
        .then(() => {
        return knex("user").insert(user);
    });
}
exports.seed = seed;
