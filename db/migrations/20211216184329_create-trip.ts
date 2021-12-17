import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("trip", function (table) {
    table.uuid("trip_id").primary();
    table.string("name", 128).notNullable();
    table.date("start").notNullable();
    table.date("end").notNullable();
    table.string("country", 128).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("trip");
}
