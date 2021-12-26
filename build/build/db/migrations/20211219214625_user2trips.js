"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable("user2trips", function (table) {
        table.uuid("trip_id").primary();
        table.string("name", 128).notNullable();
        table.date("start").notNullable();
        table.date("end").notNullable();
        table.string("country", 128).notNullable();
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTableIfExists("user2trips");
}
exports.down = down;
