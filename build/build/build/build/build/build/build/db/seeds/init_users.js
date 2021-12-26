"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const user = [
    {
        email: "123@yohoo.com",
        password: "huhu123",
    },
    {
        email: "superuser@yohoo.de",
        password: "superEasy",
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
