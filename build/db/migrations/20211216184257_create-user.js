"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable("user", function (table) {
        table.string("email", 128).primary().notNullable();
        table.string("password", 128).notNullable();
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTableIfExists("user");
}
exports.down = down;